# Verifica se Docker è installato
$dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerCmd) {
    Write-Host "Docker non è installato. Sto scaricando Docker Desktop..."
    
    # URL dell'installer di Docker Desktop per Windows (versione amd64/stabile)
    $downloadUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
    $installerPath = "$env:TEMP\DockerDesktopInstaller.exe"
    
    try {
        Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing
        Write-Host "Download completato. Avvio dell'installer di Docker Desktop..."
        
        # Avvia l'installer con privilegi admin; l'utente dovrà seguire le istruzioni
        Start-Process -FilePath $installerPath -Wait -Verb RunAs
        Write-Host "Installazione completata. Riavvia lo script per avviare i container."
    }
    catch {
        Write-Error "Download o esecuzione dell'installer fallita: $_"
    }
    exit 0
}

Write-Host "Docker è installato. Avvio dei container..."
docker-compose up --build