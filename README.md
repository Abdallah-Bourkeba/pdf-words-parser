# PDF Parser

This website allows users to upload a PDF file and extract the text from it. The text is then split into an array of words, and repeated words are removed. The final result is a list of unique words from the PDF file.

Additionally, the website allows users to save any unknown words from the PDF and track them for later reference. Unknown words are saved with the associated PDF file name and the user's name for easy tracking.

The website also has a feature that allows users to view all previously saved unknown words, grouped by the PDF file they came from and the user who saved them.

The website also has a feature that allows users to view all previously uploaded PDF files, grouped by the user who uploaded them.

The Website built using Node.js, Express, MongoDB, and Multer.

## Features:

- Upload PDF files
- Extract text from PDF files
- Split text into an array of words
- Remove repeated words
- Save unknown words
- View all previously saved unknown words
- View all previously uploaded PDF files

## Note

The website only accepts PDF files as uploads
The file size upload limit is 5GB

## Requirements

- Node.js
- MongoDB
- npm

## How to install and run

1. Clone the repository
2. Run npm install to install the dependencies
3. Start MongoDB server
4. Run node server.js to start the server
5. Visit http://localhost:3000 in your browser to access the website

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
