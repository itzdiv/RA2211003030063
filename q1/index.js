import express from "express";
import axios from "axios";

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
let windowNumbers = []; // Stores unique numbers within the window size

const API_ENDPOINTS = {
  p: "http://20.244.56.144/test/primes",
  f: "http://20.244.56.144/test/fibo",
  e: "http://20.244.56.144/test/even",
  r: "http://20.244.56.144/test/rand"
};

// Your provided Bearer token
const BEARER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQyNDc2NjMzLCJpYXQiOjE3NDI0NzYzMzMsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjgwZTA0M2RlLTRjYmMtNDc3NC04MzMyLTgwM2VhZjRmOWQxOCIsInN1YiI6ImRpdnlhbnNoLm1hbGFuaUBnbWFpbC5jb20ifSwiY29tcGFueU5hbWUiOiJtaXN0ZXJEb29kbGUiLCJjbGllbnRJRCI6IjgwZTA0M2RlLTRjYmMtNDc3NC04MzMyLTgwM2VhZjRmOWQxOCIsImNsaWVudFNlY3JldCI6IkVlbWtUWlZnVGVPQ2lsWEciLCJvd25lck5hbWUiOiJEaXZ5YW5zaCBNYWxhbmkiLCJvd25lckVtYWlsIjoiZGl2eWFuc2gubWFsYW5pQGdtYWlsLmNvbSIsInJvbGxObyI6IlJBMjIxMTAwMzAzMDA2MyJ9.T419tBosX-ej2t1AxV7X1C6Ip12e5w5aRr5InRWDITE";

// Function to fetch numbers from third-party API with authentication
const fetchNumbers = async (type) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 500);
  
      const response = await axios.get(API_ENDPOINTS[type], {
        signal: controller.signal,
        timeout: 500,
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQyNDc2NjMzLCJpYXQiOjE3NDI0NzYzMzMsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjgwZTA0M2RlLTRjYmMtNDc3NC04MzMyLTgwM2VhZjRmOWQxOCIsInN1YiI6ImRpdnlhbnNoLm1hbGFuaUBnbWFsLmNvbSJ9LCJjb21wYW55TmFtZSI6Im1pc3RlckRvb2RsZSIsImNsaWVudElEIjoiODBlMDQzZGUtNGNiYy00Nzc0LTgzMzItODAzZWFmNGY5ZDE4IiwiY2xpZW50U2VjcmV0IjoiRWVta1RaVmdUZU9DaWxYRyIsIm93bmVyTmFtZSI6IkRpdnlhbnNoIE1hbGFuaSIsIm93bmVyRW1haWwiOiJkaXZ5YW5zaC5tYWxhbmlAZ21haWwuY29tIiwicm9sbE5vIjoiUkEyMjExMDAzMDMwMDYzIn0.T419tBosX-ej2t1AxV7X1C6Ip12e5w5aRr5InRWDITE`
        }
      });
  
      clearTimeout(timeout);
      return response.data.numbers || [];
    } catch (error) {
      console.error(`Error fetching ${type} numbers:`, error.message);
      return [];
    }
  };
  

// Function to update the window of numbers
const updateWindow = (newNumbers) => {
  const uniqueNumbers = newNumbers.filter(num => !windowNumbers.includes(num));
  windowNumbers = [...windowNumbers, ...uniqueNumbers].slice(-WINDOW_SIZE);
};

// Function to calculate average
const calculateAverage = (numbers) => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return parseFloat((sum / numbers.length).toFixed(2));
};

// API Route
app.get("/numbers/:type", async (req, res) => {
  const { type } = req.params;
  if (!API_ENDPOINTS[type]) {
    return res.status(400).json({ error: "Invalid number type" });
  }

  const previousState = [...windowNumbers]; // Store previous state before update
  const newNumbers = await fetchNumbers(type);
  updateWindow(newNumbers);

  res.json({
    windowPrevState: previousState,
    windowCurrState: windowNumbers,
    numbers: newNumbers,
    avg: calculateAverage(windowNumbers)
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
