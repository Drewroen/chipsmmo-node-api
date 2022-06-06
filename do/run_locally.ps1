Remove-Item dist -Force -Recurse
tsc
nodemon dist/server.js
