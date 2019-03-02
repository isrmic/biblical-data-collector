const fs = require('fs');
const {
  join
} = require('path');

const config = require('../config');

const booksdir = config.book.directory;

const filesbooksdir = fs.readdirSync(booksdir);

const books = [];

filesbooksdir.map(filename => {

  const bookcontent = fs.readFileSync(join(booksdir, filename), 'utf8').trim();
  const book = JSON.parse(bookcontent);
  books.push(book);
});

fs.writeFile(join(config.allbooks.directory, config.allbooks.filename), JSON.stringify(books), async err => {
  if (err)
    throw err;
  console.log("Livros unificados com sucesso!!");
})