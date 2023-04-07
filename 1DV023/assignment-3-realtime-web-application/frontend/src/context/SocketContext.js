import React, { createContext } from 'react'
import { io } from 'socket.io-client'
const sockerURL = 'http://localhost:8081'

export const socket = io(sockerURL, { transports: ['websocket'] })
export const SocketContext = createContext({})
