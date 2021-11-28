import {useEffect, useRef, useState} from "react";

const App = () => {
    const ws = useRef(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [username, setUsername] = useState('');

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:8000/chat');

        ws.current.onmessage = event => {
            const decode = JSON.parse(event.data);

            if (decode.type === 'NEW_MESSAGE') {
                setMessages(prev => [
                    ...prev,
                    decode.message]);
            }

            if (decode.type === 'CONNECTED') {
                setUsername(decode.username)
            }
        };
    }, []);

    const sendMessage = () => {
        ws.current.send(JSON.stringify({
            type: 'CREATE_MESSAGE',
            message,
        }));
    };

    const changeUsername = () => {
        ws.current.send(JSON.stringify({
            type: 'CHANGE_USERNAME',
            username,
        }))
    };

    return (
        <div>
            <p>
                <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
            </p>
            <button onClick={changeUsername}>Change UserName</button>
            <p>
                <input
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                />
            </p>
            <button onClick={sendMessage}>Send Message</button>
            <div>
                {messages.map((message, id) => (
                    <p key={id}><b>{message.username} </b>{message.text}</p>
                ))}
            </div>
        </div>
    );
};

export default App;
