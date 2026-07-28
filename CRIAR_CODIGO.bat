@echo off
title MU Idle - Criando Codigo Fonte
color 0B

echo ========================================
echo    CRIANDO ARQUIVOS DO PROJETO
echo ========================================
echo.

:: ==========================================
:: SHARED TYPES
:: ==========================================
echo Criando tipos compartilhados...

mkdir shared\types 2>nul

(
echo export enum Class {
echo   DARK_KNIGHT = 'DARK_KNIGHT',
echo   DARK_WIZARD = 'DARK_WIZARD',
echo   ELF = 'ELF',
echo   SUMMONER = 'SUMMONER'
echo }
echo.
echo export interface Position {
echo   x: number;
echo   y: number;
echo }
echo.
echo export interface PlayerStats {
echo   str: number;
echo   agi: number;
echo   vit: number;
echo   ene: number;
echo }
echo.
echo export interface Player {
echo   id: string;
echo   name: string;
echo   class: Class;
echo   level: number;
echo   exp: number;
echo   zen: number;
echo   stats: PlayerStats;
echo   currentHp: number;
echo   maxHp: number;
echo   currentMana: number;
echo   maxMana: number;
echo }
echo.
echo export interface Monster {
echo   id: string;
echo   name: string;
echo   hp: number;
echo   maxHp: number;
echo   attack: number;
echo   defense: number;
echo   exp: number;
echo }
echo.
echo export interface Item {
echo   id: string;
echo   name: string;
echo   type: string;
echo   attack?: number;
echo   defense?: number;
echo }
) > shared\types\index.ts

echo ✅ Tipos criados!

:: ==========================================
:: CLIENTE
:: ==========================================
echo.
echo Criando cliente...

:: vite.config.ts
(
echo import { defineConfig } from 'vite'
echo import react from '@vitejs/plugin-react'
echo.
echo export default defineConfig({
echo   plugins: [react()],
echo   server: {
echo     port: 5173,
echo     proxy: {
echo       '/api': {
echo         target: 'http://localhost:3001',
echo         changeOrigin: true
echo       },
echo       '/ws': {
echo         target: 'ws://localhost:3001',
echo         ws: true
echo       }
echo     }
echo   }
echo })
) > client\vite.config.ts

:: index.html
(
echo ^<!DOCTYPE html^>
echo ^<html lang="pt-BR"^>
echo   ^<head^>
echo     ^<meta charset="UTF-8" /^>
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0" /^>
echo     ^<title^>MU Idle - MMORPG^</title^>
echo   ^</head^>
echo   ^<body^>
echo     ^<div id="root"^>^</div^>
echo     ^<script type="module" src="/src/main.tsx"^>^</script^>
echo   ^</body^>
echo ^</html^>
) > client\index.html

:: src/main.tsx
(
echo import React from 'react'
echo import ReactDOM from 'react-dom/client'
echo import App from './App'
echo import './styles/globals.css'
echo.
echo ReactDOM.createRoot(document.getElementById('root')!).render(
echo   ^<React.StrictMode^>
echo     ^<App /^>
echo   ^</React.StrictMode^>,
echo )
) > client\src\main.tsx

:: src/App.tsx
(
echo import { useState } from 'react'
echo.
echo function App() {
echo   const [page, setPage] = useState('login')
echo   const [loggedIn, setLoggedIn] = useState(false)
echo.
echo   return (
echo     ^<div className="min-h-screen bg-gray-900 text-white"^>
echo       {!loggedIn ? (
echo         ^<div className="flex items-center justify-center min-h-screen"^>
echo           ^<div className="bg-gray-800 p-8 rounded-lg w-96"^>
echo             ^<h1 className="text-4xl font-bold text-yellow-500 text-center mb-8"^>MU Idle^</h1^>
echo             ^<div className="space-y-4"^>
echo               ^<input
echo                 type="text"
echo                 placeholder="Usuário"
echo                 className="w-full p-3 rounded bg-gray-700 border border-gray-600"
echo               /^>
echo               ^<input
echo                 type="password"
echo                 placeholder="Senha"
echo                 className="w-full p-3 rounded bg-gray-700 border border-gray-600"
echo               /^>
echo               ^<button
echo                 onClick={() =^> setLoggedIn(true)}
echo                 className="w-full p-3 bg-purple-700 rounded font-bold hover:bg-purple-600"
echo               ^>
echo                 ENTRAR
echo               ^</button^>
echo               ^<button className="w-full p-3 bg-gray-700 rounded hover:bg-gray-600"^>
echo                 CRIAR CONTA
echo               ^</button^>
echo             ^</div^>
echo           ^</div^>
echo         ^</div^>
echo       ) : (
echo         ^<div^>
echo           ^<div className="bg-gray-800 p-4 flex justify-between items-center"^>
echo             ^<div^>
echo               ^<span className="font-bold"^>Player1^</span^>
echo               ^<span className="text-gray-400 ml-2"^>Nível 1 - Dark Knight^</span^>
echo             ^</div^>
echo             ^<div className="flex gap-2"^>
echo               ^<button className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"^>Inventário^</button^>
echo               ^<button className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"^>Hunt^</button^>
echo               ^<button className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"^>Skills^</button^>
echo             ^</div^>
echo           ^</div^>
echo.
echo           ^<div className="p-8"^>
echo             ^<div className="bg-gray-800 rounded-lg p-6 mb-4"^>
echo               ^<h2 className="text-2xl font-bold mb-4"^>Área de Hunt^</h2^>
echo               ^<div className="bg-gray-700 rounded p-8 text-center"^>
echo                 ^<p className="text-gray-400 mb-4"^>Canvas do jogo será renderizado aqui^</p^>
echo                 ^<button className="px-6 py-3 bg-green-700 rounded font-bold hover:bg-green-600"^>
echo                   INICIAR HUNT
echo                 ^</button^>
echo               ^</div^>
echo             ^</div^>
echo.
echo             ^<div className="grid grid-cols-2 gap-4"^>
echo               ^<div className="bg-gray-800 rounded-lg p-6"^>
echo                 ^<h3 className="text-xl font-bold mb-4"^>Status^</h3^>
echo                 ^<div className="space-y-2"^>
echo                   ^<div className="flex justify-between"^>
echo                     ^<span^>HP^</span^>
echo                     ^<div className="w-32 bg-gray-700 rounded-full h-4"^>
echo                       ^<div className="bg-red-500 rounded-full h-4 w-3/4"^>^</div^>
echo                     ^</div^>
echo                   ^</div^>
echo                   ^<div className="flex justify-between"^>
echo                     ^<span^>XP^</span^>
echo                     ^<div className="w-32 bg-gray-700 rounded-full h-4"^>
echo                       ^<div className="bg-blue-500 rounded-full h-4 w-1/4"^>^</div^>
echo                     ^</div^>
echo                   ^</div^>
echo                 ^</div^>
echo               ^</div^>
echo.
echo               ^<div className="bg-gray-800 rounded-lg p-6"^>
echo                 ^<h3 className="text-xl font-bold mb-4"^>Party (0/3)^</h3^>
echo                 ^<div className="space-y-2"^>
echo                   ^<div className="bg-gray-700 p-3 rounded"^>Slot 1: Vazio^</div^>
echo                   ^<div className="bg-gray-700 p-3 rounded"^>Slot 2: 🔒 10.000 Zen^</div^>
echo                   ^<div className="bg-gray-700 p-3 rounded"^>Slot 3: 🔒 50.000 Zen^</div^>
echo                 ^</div^>
echo               ^</div^>
echo             ^</div^>
echo           ^</div^>
echo         ^</div^>
echo       )}
echo     ^</div^>
echo   )
echo }
echo.
echo export default App
) > client\src\App.tsx

:: src/styles/globals.css
(
echo @tailwind base;
echo @tailwind components;
echo @tailwind utilities;
echo.
echo body {
echo   margin: 0;
echo   font-family: Arial, sans-serif;
echo   background: #111827;
echo }
) > client\src\styles\globals.css

echo ✅ Cliente criado!

:: ==========================================
:: SERVIDOR
:: ==========================================
echo.
echo Criando servidor...

:: prisma/schema.prisma
mkdir server\prisma 2>nul

(
echo generator client {
echo   provider = "prisma-client-js"
echo }
echo.
echo datasource db {
echo   provider = "postgresql"
echo   url      = env("DATABASE_URL")
echo }
echo.
echo model User {
echo   id        String    @id @default(uuid())
echo   email     String    @unique
echo   password  String
echo   createdAt DateTime  @default(now())
echo   players   Player[]
echo }
echo.
echo model Player {
echo   id          String   @id @default(uuid())
echo   name        String   @unique
echo   class       String
echo   level       Int      @default(1)
echo   exp         Int      @default(0)
echo   zen         Int      @default(0)
echo   str         Int      @default(10)
echo   agi         Int      @default(10)
echo   vit         Int      @default(10)
echo   ene         Int      @default(10)
echo   currentHp   Int      @default(100)
echo   maxHp       Int      @default(100)
echo   currentMana Int      @default(50)
echo   maxMana     Int      @default(50)
echo   userId      String
echo   user        User     @relation(fields: [userId], references: [id])
echo   createdAt   DateTime @default(now())
echo }
echo.
echo model Hunt {
echo   id        String   @id @default(uuid())
echo   huntType  String
echo   wave      Int      @default(1)
echo   state     String   @default("IN_PROGRESS")
echo   playerId  String
echo   player    Player   @relation(fields: [playerId], references: [id])
echo   createdAt DateTime @default(now())
echo }
) > server\prisma\schema.prisma

:: src/index.ts
mkdir server\src 2>nul

(
echo import Fastify from 'fastify'
echo import cors from '@fastify/cors'
echo import { PrismaClient } from '@prisma/client'
echo.
echo const prisma = new PrismaClient()
echo const server = Fastify({ logger: true })
echo.
echo // Configurar CORS
echo server.register(cors, {
echo   origin: true,
echo   credentials: true
echo })
echo.
echo // Rota de saúde
echo server.get('/api/health', async () =^> {
echo   return { status: 'ok', timestamp: new Date().toISOString() }
echo })
echo.
echo // Rota de registro
echo server.post('/api/auth/register', async (request, reply) =^> {
echo   const { email, password } = request.body as any
echo.
echo   const user = await prisma.user.create({
echo     data: { email, password }
echo   })
echo.
echo   return { message: 'Usuário criado!', userId: user.id }
echo })
echo.
echo // Rota de login
echo server.post('/api/auth/login', async (request, reply) =^> {
echo   const { email, password } = request.body as any
echo.
echo   const user = await prisma.user.findFirst({
echo     where: { email, password }
echo   })
echo.
echo   if (!user) {
echo     return reply.status(401).send({ message: 'Credenciais inválidas' })
echo   }
echo.
echo   return {
echo     token: 'jwt-token-simples',
echo     userId: user.id,
echo     message: 'Login realizado!'
echo   }
echo })
echo.
echo // Rota para listar personagens
echo server.get('/api/players', async (request, reply) =^> {
echo   const players = await prisma.player.findMany()
echo   return { players }
echo })
echo.
echo // Iniciar servidor
echo const start = async () =^> {
echo   try {
echo     await server.listen({ port: 3001, host: '0.0.0.0' })
echo     console.log('🚀 Servidor rodando em http://localhost:3001')
echo   } catch (err) {
echo     console.error(err)
echo     process.exit(1)
echo   }
echo }
echo.
echo start()
) > server\src\index.ts

echo ✅ Servidor criado!

:: ==========================================
:: TAILWIND CONFIG
:: ==========================================
echo.
echo Configurando Tailwind...

(
echo /** @type {import('tailwindcss').Config} */
echo export default {
echo   content: [
echo     "./index.html",
echo     "./src/**/*.{js,ts,jsx,tsx}",
echo   ],
echo   theme: {
echo     extend: {},
echo   },
echo   plugins: [],
echo }
) > client\tailwind.config.js

(
echo export default {
echo   plugins: {
echo     tailwindcss: {},
echo     autoprefixer: {},
echo   },
echo }
) > client\postcss.config.js

echo ✅ Tailwind configurado!

:: ==========================================
:: FINAL
:: ==========================================
echo.
echo ========================================
echo    ✅ TODOS OS ARQUIVOS CRIADOS!
echo ========================================
echo.
echo Proximo passo: Execute INICIAR_TUDO.bat
pause