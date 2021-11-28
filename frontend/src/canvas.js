import React, {useState, useRef, useEffect} from 'react';

const Canvas = () => {
    const [state, setState] = useState({
        mouseDown: false,
        pixelsArray: []
    });
    const [drawPixel, setDrawPixel] = useState([]);

    const canvas = useRef(null);
    const ws = useRef(null);

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:8080/draw');

        ws.current.onmessage = event => {
            const decoded = JSON.parse(event.data);

            console.log(decoded);

            if (decoded.type === 'NEW_DRAW') {
                setDrawPixel(prev => [
                    ...prev,
                    decoded.message]);
            }

            if (decoded.type === 'CONNECTED') {

                setDrawPixel(decoded.message);
            }

        };
    }, []);

    useEffect(() => {
        const context = canvas.current.getContext('2d');
        const imageData = context.createImageData(1, 1);
        const d = imageData.data;

        d[0] = 255;
        d[1] = 0;
        d[2] = 0;
        d[3] = 255;

        drawPixel.map(drawLines => {
            drawLines.map(draw => {
                context.putImageData(imageData, draw.x, draw.y);
            })
        });
    }, [drawPixel]);

    const canvasMouseMoveHandler = event => {
        if (state.mouseDown) {
            event.persist();
            const clientX = event.clientX;
            const clientY = event.clientY;
            setState(prevState => {
                return {
                    ...prevState,
                    pixelsArray: [...prevState.pixelsArray, {
                        x: clientX,
                        y: clientY
                    }]
                };
            });

            const context = canvas.current.getContext('2d');
            const imageData = context.createImageData(1, 1);
            const d = imageData.data;

            d[0] = 0;
            d[1] = 0;
            d[2] = 0;
            d[3] = 255;

            context.putImageData(imageData, event.clientX, event.clientY);
        }
    };

    const mouseDownHandler = event => {
        setState({...state, mouseDown: true});
    };

    const mouseUpHandler = event => {
        setState({...state, mouseDown: false, pixelsArray: []});
        ws.current.send(JSON.stringify({
            type: 'CREATE_DRAW',
            message: state.pixelsArray,
        }))
    };

    return (
        <div>
            <canvas
                ref={canvas}
                style={{border: '1px solid black'}}
                width={800}
                height={600}
                onMouseDown={mouseDownHandler}
                onMouseUp={mouseUpHandler}
                onMouseMove={canvasMouseMoveHandler}
            />
        </div>
    );
};

export default Canvas;





