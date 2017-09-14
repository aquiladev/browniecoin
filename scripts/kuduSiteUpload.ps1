Param(
	[Parameter(Mandatory = $true)]
	[string]$websiteName,
	[string]$websiteSlot,
	[Parameter(Mandatory = $true)]
	[string]$sourceDir,
	[string]$destinationPath = "/site/wwwroot"
)

Function UploadDirectory {
	Param( 
		[string]$siteName = $( throw "Missing required parameter siteName"),
		[string]$sourcePath = $( throw "Missing required parameter sourcePath"),
		[string]$destinationPath = $( throw "Missing required parameter destinationPath"),
		[string]$siteSlot
	)

	$zipFile = [System.IO.Path]::GetTempFileName() + ".zip"

	ZipFiles -zipfilename $zipFile -sourcedir $sourcePath
	UploadZip -siteName $siteName -siteSlot $siteSlot -sourceZipFile $zipFile -destinationPath $destinationPath
}

Function UploadZip {
	Param( 
		[string]$siteName = $( throw "Missing required parameter siteName"),
		[string]$sourceZipFile = $( throw "Missing required parameter sourceZipFile"),
		[string]$destinationPath = $( throw "Missing required parameter destinationPath"),
		[string]$siteSlot
	)

	$websiteName = get-WebsiteName -siteName $siteName -siteSlot $siteSlot
	$kuduWebsiteName = Get-KuduWebsiteName -siteName $siteName -siteSlot $siteSlot
	$webSite = Get-AzureWebsite -Name $websiteName

	$timeOutSec = 6000

	$username = $webSite.PublishingUsername
	$password = $webSite.PublishingPassword
	$base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(("{0}:{1}" -f $username,$password)))

	$baseUrl = "https://" + $kuduWebsiteName + ".scm.azurewebsites.net"
	$apiUrl = JoinParts ($baseUrl, "api/zip", $destinationPath) '/'

	$request = $null
    try {
        # $request = Invoke-WebRequest -Uri $testUri -MaximumRedirection $maximumRedirection -ErrorAction SilentlyContinue
		$request = Invoke-RestMethod -Uri $apiUrl -Headers @{Authorization=("Basic {0}" -f $base64AuthInfo)} -Method PUT -InFile $sourceZipFile -ContentType "multipart/form-data" -TimeoutSec $timeOutSec
    } 
    catch [System.Net.WebException] {
        $request = $_.Exception.Response

    }
    catch {
        Write-Error $_.Exception
        return $null
    }   
}

Function JoinParts {
	Param ([string[]] $Parts, [string] $Separator = '/')

	$search = '(?<!:)' + [regex]::Escape($Separator) + '+'  #Replace multiples except in front of a colon for URLs.
	$replace = $Separator
	($Parts | ? {$_ -and $_.Trim().Length}) -join $Separator -replace $search, $replace
}

Function ZipFiles {
	Param(
		[Parameter(Mandatory = $true)]
		[String]$zipfilename,
		[Parameter(Mandatory = $true)]
		[String]$sourcedir
	)

	Add-Type -Assembly System.IO.Compression.FileSystem
	$compressionLevel = [System.IO.Compression.CompressionLevel]::Optimal
	[System.IO.Compression.ZipFile]::CreateFromDirectory($sourcedir, $zipfilename, $compressionLevel, $false)
}

Function Get-KuduWebsiteName {
	Param( 
		[string]$siteName = $( throw "Missing required parameter siteName"),
		[string]$siteSlot
	)

	if([string]::IsNullOrWhiteSpace($siteSlot)) {            
		return $siteName
	}
	return "$siteName-$siteSlot"
}

Function Get-WebsiteName {
	Param(
		[string]$siteName = $( throw "Missing required parameter siteName"),
		[string]$siteSlot
	)

	if([string]::IsNullOrWhiteSpace($siteSlot)) {            
		return $siteName
	}
	return "$siteName($siteSlot)"
}

$startTime = Get-Date
$websiteNameSlot = Get-WebsiteName -siteName $websiteName -siteSlot $websiteSlot

Write-Host "Stopping webSite"
Stop-AzureWebsite -Name $websiteNameSlot
Write-Host "Publishing webSite"
UploadDirectory -siteName $websiteName -siteSlot $websiteSlot -sourcePath $sourceDir -destinationPath $destinationPath
Write-Host "Starting webSite"
Start-AzureWebsite -Name $websiteNameSlot
$finishTime = Get-Date
Write-Host (" Total time used (minutes): {0}" -f ($finishTime - $startTime).TotalMinutes)