cd d:\AI-studio-web\backend\python-services; docker-compose up --build -d
Start-Sleep -Seconds 3; docker logs aistudio-go-backend
docker-compose up --build -d go-backend