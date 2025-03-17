import { Types } from "@ellementul/uee-core"

import { assertLog, later, successfulColor } from './test.utils.js'

import { PeerJsTransport } from '../../index.js'

export async function runTests() {
    const id = Types.UUID.Def().rand()

    console.log(`%c Peers Transport test is running with id: ${id}`, successfulColor + "; text-decoration:underline")

    const transport = new PeerJsTransport({ isHost: true, id })

    const url = new URL(location)
    url.pathname = "/client"
    url.searchParams.set("id", id)

    assertLog("Constructor", transport)

    document.body.insertAdjacentHTML("beforeend", `
        <a target="_blank" href="${url}">Ссылка на клиент</a>
    `)

    transport.onConnection(afterConnection)
    transport.onDisconnection(msg => assertLog("onDisconnectionHost", msg.isHost))

    let reciveCallback

    transport.connect(msg => reciveCallback(msg))


    async function afterConnection (msg) {
        assertLog("onConnectionHost", msg.isHost)

        const limit = 512
        const start = Date.now()
        const payload = "TestPayload"
        const payloadBytes = new Blob([payload]).size

        const indexes = []

        reciveCallback = ({ index }) => {
            indexes.push(index)

            if(index == limit)
                assertLog(`Limit messages: ${limit}; All data size: ${limit*limit*payloadBytes} bytes; Time: ${Date.now() - start} ms`, index == limit)
        }

        for (let index = 0; index <= limit; index++) {
            transport.send({ index, testPayload: payload.repeat(limit) })
        }

        await later(250)

        assertLog("Got all index in right order", indexes.every((index, counter) => index == counter) && indexes.length == limit + 1)

        if(indexes.length !== limit + 1)
            console.log("Losed events: ", (limit + 1) - indexes.length)

        transport.disconnect()
    }
}

