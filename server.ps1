$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$prefix = "http://localhost:8088/"
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Cowinmagnet LATAM local server running at $prefix"

$types = @{
  ".html" = "text/html; charset=utf-8"
  ".css" = "text/css; charset=utf-8"
  ".js" = "application/javascript; charset=utf-8"
  ".xml" = "application/xml; charset=utf-8"
  ".txt" = "text/plain; charset=utf-8"
  ".md" = "text/markdown; charset=utf-8"
  ".jpg" = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".png" = "image/png"
}

while ($listener.IsListening) {
  $context = $listener.GetContext()
  $path = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart("/"))
  if ([string]::IsNullOrWhiteSpace($path)) { $path = "index.html" }
  $file = Join-Path $root $path
  $resolvedRoot = [System.IO.Path]::GetFullPath($root)
  $resolvedFile = [System.IO.Path]::GetFullPath($file)

  if (-not $resolvedFile.StartsWith($resolvedRoot) -or -not (Test-Path -LiteralPath $resolvedFile -PathType Leaf)) {
    $context.Response.StatusCode = 404
    $bytes = [Text.Encoding]::UTF8.GetBytes("Not found")
  } else {
    $context.Response.StatusCode = 200
    $extension = [System.IO.Path]::GetExtension($resolvedFile).ToLowerInvariant()
    if ($types.ContainsKey($extension)) { $context.Response.ContentType = $types[$extension] }
    $bytes = [System.IO.File]::ReadAllBytes($resolvedFile)
  }

  $context.Response.ContentLength64 = $bytes.Length
  $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  $context.Response.OutputStream.Close()
}
