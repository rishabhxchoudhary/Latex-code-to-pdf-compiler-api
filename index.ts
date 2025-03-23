import express from 'express';
import type { Request, Response } from 'express';
import latex from "node-latex";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const port = 3001;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

// @ts-ignore
app.post('/api/compile-latex', (req: Request, res: Response) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "LaTeX code is required." });
  }

  try {
    console.log("compiling pdf");
    const pdfChunks: Buffer[] = [];
    const pdfStream = latex(code);

    pdfStream.on('data', (chunk: Buffer) => {
      pdfChunks.push(chunk);
    });

    pdfStream.on('error', (err: Error) => {
      console.error("Error compiling LaTeX:", err);
      // Sending a JSON error response if compilation fails
      return res.status(500).json({ error: "Failed to compile LaTeX." });
    });

    pdfStream.on('end', () => {
      console.log("pdf compiled successfully");
      // @ts-ignore
      const pdfBuffer = Buffer.concat(pdfChunks);
      res.setHeader('Content-Disposition', 'attachment; filename="output.pdf"');
      res.setHeader('Content-Type', 'application/pdf');
      return res.send(pdfBuffer);
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.info(`Example app listening on port ${port}`);
});
