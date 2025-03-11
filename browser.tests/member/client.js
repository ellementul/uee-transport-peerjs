import { EventFactory, Types, MemberFactory, connectionEvent, disconnectionEvent } from "@ellementul/uee-core"

import { assertLog, successfulColor } from './test.utils.js'
import { PeerJsTransport } from '../../index.js'


export function runEchoClient() {

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id')

    console.log(`%c Peers Transport client is running with id: ${id}`, successfulColor + "; text-decoration:underline")

    const transport = new PeerJsTransport({ isHost: false, id })

    const room = new MemberFactory
    room.makeRoom({ transport: transport })
    room.connect()

    room.subscribe(connectionEvent, async ({ isHost }) => {
        assertLog("Client connected", !isHost)
    })

    const event = EventFactory(Types.Object.Def({ system: "test" }))
    const secondEvent = EventFactory(Types.Object.Def({ system: "test2" }))

    room.subscribe(event, () => {
        assertLog("Client got message", true)
        room.send(secondEvent)
    })

    room.subscribe(disconnectionEvent, async ({ isHost }) => {
        assertLog("Host disconnected", !isHost)
    })

    assertLog("Client loaded", true)
}