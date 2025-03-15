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

        const counter = { count: 0, id }
        const limit = 1024
        const start = Date.now()

        reciveCallback = ({ count }) => {
            counter.count = count + 1
            

            if(count >= limit)
                assertLog(`Limit messages: ${limit}; Time: ${Date.now() - start} ms`, count == limit)
            else
                transport.send(counter)
        }

        transport.send(counter)

        await later(300)

        transport.disconnect()
    }
}

