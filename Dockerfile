# Verwende ein Basis-Image als Ausgangspunkt
FROM node:14

# Setze das Arbeitsverzeichnis im Container
# WORKDIR 

# Kopiere die package.json und package-lock.json in das Arbeitsverzeichnis
COPY package*.json ./

# Installiere Abhängigkeiten
RUN npm install

# Kopiere den Rest des Codes in das Arbeitsverzeichnis
COPY . .

# Setze den Befehl, der ausgeführt wird, wenn der Container gestartet wird
CMD ["node", "docker.js"]
