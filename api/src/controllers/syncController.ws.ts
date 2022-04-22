import WebSocket, { WebSocketServer } from 'ws';
import { Server as HttpServer } from 'http';
import JMDict from "../jmdict";
import { checkToken } from '../middleware/authorization';

const wss = new WebSocketServer({ noServer: true });

interface EventResponse {
    event?: 'Result' | 'Prompt',
    error?: string,
};

interface ResultResponse extends EventResponse {
    event: 'Result',
    result: any,
};

interface SyncRequest {
    wordId: string,
    script: string,
};

interface CallRequest {
    inputs: { [k: string]: any },
    script: string,
};

function createCallMessage(syncMsg: SyncRequest): CallRequest {
    const jWord = JMDict.getUnprocessedWord(syncMsg.wordId);
    const yWord = JMDict.getWord(syncMsg.wordId);

    return {
        script: syncMsg.script,
        inputs: {
            jWord,
            yWord,
            tags: JMDict.tags,
            word: jWord,
        },
    };
}

export function setupWsProxy(httpServer: HttpServer, funcboxUri: string) {
    httpServer.on('upgrade', (req, socket, head) => {
        const url = new URL(req.url, `http://${req.headers.host}`);

        // Only supported path
        if (url.pathname !== '/ws/sync') {
            socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
            socket.destroy();
            return;
        }

        // Make sure that connection is authorized
        const token = url.searchParams.get('token');

        if (!(token && checkToken(token))) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return;
        }

        // WebSocket messages will be proxied here after modifying requests
        const funcboxWs = new WebSocket(funcboxUri);

        funcboxWs.on('open', () => {
            wss.handleUpgrade(req, socket, head, function(clientWs) {
                // Act as an intermediary between the client and the funcbox server
                funcboxWs.on('message', createFuncboxMessageHandler(clientWs));
                clientWs.on('message', createWsProxyMessageHandler(funcboxWs));

                // Close connection whenever either side closes connection
                funcboxWs.on('close', () => {
                    clientWs.close();
                });
                clientWs.on('close', () => {
                    funcboxWs.close();
                });
            });
        });
    });
}

/**
 * This function returns a function which will process messages from the funcbox
 * server and then send a response to the WebSocket currently being served.
 * @param ws WebSocket to send messages to after handling response
 * @returns WebSocket onmessage event handler
 */
function createFuncboxMessageHandler(ws: WebSocket.WebSocket) {
    return function (data: WebSocket.RawData) {
        ws.send(String(data));
    }
}

/**
 * This function handles messages from the requesting client WebSocket
 * and forwards transformed/contructed messages to the funcbox server.
 * @param funcboxWs The funcbox WebSocket connection
 * @returns WebSocket onmessage event handler
 */
function createWsProxyMessageHandler(funcboxWs: WebSocket) {
    return function (data: WebSocket.RawData, isBinary: boolean) {
        if (isBinary) return;

        if (this.handledFirstRequest) {
            funcboxWs.send(String(data));
            return;
        }

        let message: SyncRequest;
        try {
            message = JSON.parse(String(data));
        } catch (e) {
            return;
        }

        // The intial request must have these fields
        if (!message.script || !message.wordId)
            return;

        const callMessage = createCallMessage(message);
        funcboxWs.send(JSON.stringify(callMessage));
        this.handledFirstRequest = true;
    }
}
