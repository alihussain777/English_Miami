$keyPath = "$HOME\.ssh\id_ed25519"
while ($true) {
    Write-Host "[KeepAlive] Connecting persistent tunnel to serveo.net..."
    & "C:\Windows\System32\OpenSSH\ssh.exe" -i $keyPath -o StrictHostKeyChecking=no -o ServerAliveInterval=15 -o ServerAliveCountMax=3 -R 80:localhost:3000 serveo.net
    Write-Host "[KeepAlive] Connection closed, auto-reconnecting in 2 seconds..."
    Start-Sleep -Seconds 2
}
