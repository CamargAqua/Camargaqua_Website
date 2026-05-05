# Tiny static file server for local preview
$port = 5500
$root = (Get-Location).Path
Add-Type -AssemblyName System.Web
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://127.0.0.1:$port/")
$listener.Start()
Write-Host "Serving $root on http://127.0.0.1:$port/"

$mime = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".webp" = "image/webp"
    ".xml"  = "application/xml; charset=utf-8"
    ".txt"  = "text/plain; charset=utf-8"
    ".ico"  = "image/x-icon"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".json" = "application/json; charset=utf-8"
}

while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response
    try {
        $path = [System.Web.HttpUtility]::UrlDecode($req.Url.AbsolutePath)
        if ($path -eq "/") { $path = "/index.html" }
        $full = Join-Path $root ($path.TrimStart("/"))
        if (Test-Path $full -PathType Container) { $full = Join-Path $full "index.html" }
        if (-not (Test-Path $full -PathType Leaf)) {
            $full = Join-Path $root "404.html"
            $res.StatusCode = 404
        }
        $ext = [System.IO.Path]::GetExtension($full).ToLower()
        $type = $mime[$ext]
        if (-not $type) { $type = "application/octet-stream" }
        $res.ContentType = $type
        $bytes = [System.IO.File]::ReadAllBytes($full)
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
        Write-Host "$($res.StatusCode) $($req.HttpMethod) $($req.Url.AbsolutePath)"
    } catch {
        $res.StatusCode = 500
        Write-Host "500 $($req.Url.AbsolutePath) - $_"
    } finally {
        $res.OutputStream.Close()
    }
}
