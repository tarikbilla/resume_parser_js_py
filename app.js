// app.js

const express = require('express');
const multer = require('multer');
const { PythonShell } = require('python-shell');
const path = require('path');
const fs = require('fs'); // Import the fs module

const app = express();
const upload = multer({ dest: 'uploads/' }); // Directory to store uploaded files

app.use(express.static('public')); // Serve static files from the 'public' directory

// Define a route for the root URL ("/") to serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
 

app.post('/', upload.single('file'), (req, res) => {
  const zipFilePath = req.file.path; // Path of the uploaded file
  const jobDescription = req.body.description; // Job description from the textarea

  const options = {
    pythonPath: 'python', // Change this to the path of your Python3 executable if needed
    args: [zipFilePath, jobDescription],
  };

  // Use PythonShell.run with Promise
  PythonShell.run('resume_parser.py', options)
    .then(results => {
      // Parse the output from the Python script and send it back as JSON
      console.log("Data is: "+results);
      const parsedResults = JSON.parse(results);
      res.json(parsedResults);

      // Delete files in the "resumes" folder
      fs.readdir('resumes', (err, files) => {
        if (err) {
          console.error('Error reading "resumes" folder:', err);
        } else {
          files.forEach(file => {
            const filePath = path.join('resumes', file);
            fs.unlink(filePath, err => {
              if (err) {
                console.error('Error deleting file:', filePath, err);
              } else {
                console.log('File deleted:', filePath);
              }
            });
          });
        }
      });
    })
    .catch(err => {
      console.error('Error executing Python script:', err);
      res.status(500).send('Error processing the file.');
    });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
