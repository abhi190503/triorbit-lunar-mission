param(
  [Parameter(Mandatory = $true)] [string]$Repository,
  [switch]$CreateProject
)

$ErrorActionPreference = 'Stop'
$PackRoot = Split-Path -Parent $PSScriptRoot
$manifest = Join-Path $PackRoot 'issues.json'
if (!(Test-Path $manifest)) { throw "Missing planning pack issues.json: $manifest" }
if ($Repository -notmatch '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$') { throw 'Repository must be verified OWNER/REPO' }

# NASA global GO Team start time: 2026-11-14 09:00 Asia/Colombo = 03:30 UTC.
$startUTC = [datetime]::SpecifyKind([datetime]'2026-11-14T03:30:00',[DateTimeKind]::Utc)
if ([datetime]::UtcNow -lt $startUTC) {
  throw 'STOP: NASA hackathon has not started (Nov 14, 2026, 09:00 Asia/Colombo). This script will not create anything early.'
}
if (!(Get-Command gh -ErrorAction SilentlyContinue)) { throw 'GitHub CLI (gh) not installed. Install it or use GitHub UI.' }
& gh auth status
if ($LASTEXITCODE -ne 0) { throw 'gh is not authenticated: run gh auth login for the correct account' }
$owner = $Repository.Split('/')[0]
$actualRepo = (& gh repo view $Repository --json nameWithOwner --jq '.nameWithOwner' 2>&1)
if ($LASTEXITCODE -ne 0 -or ($actualRepo | Out-String).Trim() -ne $Repository) {
  throw "Repository $Repository is unavailable or mismatched. Create and verify it first."
}
$confirm = Read-Host "This creates GitHub issues in $Repository. Type CREATE to proceed"
if ($confirm -cne 'CREATE') { Write-Host 'Cancelled; no changes made.'; exit 0 }

$rows = @(Get-Content -Raw -Encoding UTF8 $manifest | ConvertFrom-Json)
$existing = @((& gh issue list -R $Repository --state all --limit 500 --json number,title,url | Out-String | ConvertFrom-Json))
if ($LASTEXITCODE -ne 0) { throw 'Unable to read GitHub issue list safely; stopped.' }

# Optional GitHub handle mapping. Do not guess any usernames.
$mappingPath = Join-Path $PackRoot 'owner_handles.json'
$handles = @{}
if (Test-Path $mappingPath) {
  $mapping = Get-Content -Raw -Encoding UTF8 $mappingPath | ConvertFrom-Json
  foreach ($item in $mapping.PSObject.Properties) {
    if ($item.Value -and $item.Value -match '^[A-Za-z0-9-]+$') { $handles[$item.Name] = $item.Value }
  }
}

# Labels are convenience metadata, not a reason to fail safe issue import.
$labels = @(
  @{name='priority:p0';color='B60205'},
  @{name='priority:p1';color='FBCA04'},
  @{name='priority:p2';color='0E8A16'},
  @{name='phase:prep';color='5319E7'},
  @{name='phase:sat';color='0052CC'},
  @{name='phase:sun';color='1D76DB'},
  @{name='phase:optional';color='C2E0C6'}
)
foreach ($lab in $labels) {
  & gh label create $lab.name -R $Repository --color $lab.color --force | Out-Null
  if ($LASTEXITCODE -ne 0) { Write-Warning "Could not create/update label $($lab.name)." }
}

$projectNum = $null
if ($CreateProject) {
  try {
    $allProjectOutput = & gh project list --owner $owner --format json 2>&1
    if ($LASTEXITCODE -ne 0) { throw 'Project list unavailable; may require gh auth refresh -s project.' }
    $projectData = $allProjectOutput | Out-String | ConvertFrom-Json
    $found = @($projectData.projects | Where-Object { $_.title -eq 'TriOrbit | NASA Space Apps 2026' })
    if ($found.Count -gt 0) { $projectNum = $found[0].number }
    else {
      $createdOutput = & gh project create --owner $owner --title 'TriOrbit | NASA Space Apps 2026' --format json 2>&1
      if ($LASTEXITCODE -ne 0) { throw "Project create failed: $createdOutput" }
      $projectNum = ($createdOutput | Out-String | ConvertFrom-Json).number
    }
    if ($null -ne $projectNum) {
      Write-Host "GitHub Project board: $projectNum (owner $owner)"
      & gh project link $projectNum --owner $owner --repo $Repository | Out-Null
      if ($LASTEXITCODE -ne 0) { Write-Warning 'Board link failed; issues can still be added.' }
    }
  } catch {
    Write-Warning "GitHub Projects creation/linking skipped: $_. Continue issue creation; create board in UI later."
  }
}

$results = New-Object System.Collections.Generic.List[object]
foreach ($r in $rows) {
  $id = [string]$r.'Task ID'
  $title = "[$id] $($r.Title)"
  $bodyFile = Join-Path (Join-Path $PackRoot 'issues') "$id.md"
  if (!(Test-Path $bodyFile)) { throw "Missing body for $id" }
  # startswith is the canonical match; avoid PowerShell wildcard [] semantics
  $match = @($existing | Where-Object { $_.title.StartsWith("[$id]") })
  if ($match.Count -gt 1) { Write-Warning "Multiple issues for $id. Resolve manually."; continue }
  if ($match.Count -eq 1) {
    $url = $match[0].url
    $number = $match[0].number
    Write-Host "Exists: $id -> #$number"
  } else {
    $phaseTag = if ($r.Phase -eq 'PREP') {'phase:prep'} elseif ($r.Phase.StartsWith('SAT-')) {'phase:sat'} elseif ($r.Phase.StartsWith('SUN-')) {'phase:sun'} else {'phase:optional'}
    $args = @('issue','create','-R',$Repository,'--title',$title,'--body-file',$bodyFile,'--label',"priority:$($r.Priority.ToLower())",'--label',$phaseTag)
    if ($handles.ContainsKey([string]$r.Owner)) {
      $handle = [string]$handles[[string]$r.Owner]
      & gh api "repos/$Repository/collaborators/$handle" --silent 2>$null
      if ($LASTEXITCODE -eq 0) { $args += @('--assignee',$handle) }
      else { Write-Warning "GitHub handle @$handle not an accepted collaborator; issue $id will remain unassigned." }
    }
    $created = & gh @args 2>&1
    if ($LASTEXITCODE -ne 0) { Write-Warning "FAILED $id : $created"; continue }
    $url = ($created | Out-String).Trim()
    $number = ($url -split '/')[-1]
    Write-Host "Created: $id -> $url"
  }
  $results.Add([pscustomobject]@{TaskID=$id;IssueNumber=$number;IssueURL=$url;Owner=$r.Owner})
  if ($null -ne $projectNum) {
    & gh project item-add $projectNum --owner $owner --url $url | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Warning "Board add failed for $id; use GitHub UI later." }
  }
}
$out = Join-Path $PackRoot 'created_issue_links.csv'
$results | Export-Csv -NoTypeInformation -Encoding UTF8 $out
Write-Host "Finished. Mapping saved at $out. Created/verified $($results.Count) task IDs."
