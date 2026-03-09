const express = require('express');
const { SerialPort } = require('serialport'); // Import the serialport module
const { ReadlineParser } = require('@serialport/parser-readline');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Initialize SerialPort
const arduinoPort = new SerialPort({ path: 'COM3', baudRate: 9600 }); // Change 'COM5' to your port
const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

parser.on('data', (data) => {
  console.log(`Received data from Arduino: ${data}`);
});

app.use(express.static(path.join(__dirname, 'public')));


app.post('/send', (req, res) => {
  const message = req.body.message;
  arduinoPort.write(`SEND ${message}\n`, (err) => {
    if (err) {
      return res.status(500).send('Error sending message');
    }
    res.send('Message sent');
  });
});

app.post('/call', (req, res) => {
  arduinoPort.write('CALL\n', (err) => {
    if (err) {
      return res.status(500).send('Error making call');
    }
    res.send('Calling');
  });
});

app.post('/number', (req, res) => {
  const number = req.body.number;
  arduinoPort.write(`NUMBER ${number}\n`, (err) => {
    if (err) {
      return res.status(500).send('Error setting number');
    }
    res.send('Number updated');
  });
});

app.post('/blink', (req, res) => {
  const led = req.body.led;
  let command;
  if (led === 1) {
    command = 'BLINK1\n';
  } else if (led === 2) {
    command = 'BLINK2\n';
  } else {
    return res.status(400).send('Invalid LED number');
  }
  arduinoPort.write(command, (err) => {
    if (err) {
      return res.status(500).send('Error blinking LED');
    }
    res.send('Blink command sent');
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
