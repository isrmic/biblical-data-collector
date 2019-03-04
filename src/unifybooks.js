const fs = require('fs');
const {
  join
} = require('path');

const listorderedbooks = ["Gênesis","Êxodo","Levítico","Números","Deuteronômio","Josué","Juízes","Rute","1Samuel","2Samuel","1Reis","2Reis","1Crônicas","2Crônicas","Esdras","Neemias","Ester","Jó","Salmos","Provérbios","Eclesiastes","Cântico dos Cânticos","Isaías","Jeremias","Lamentações","Ezequiel","Daniel","Oseias","Joel","Amós","Obadias","Jonas","Miqueias","Naum","Habacuque","Sofonias","Ageu","Zacarias","Malaquias", "Mateus","Marcos","Lucas","João","Atos","Romanos","1Coríntios","2Coríntios","Gálatas","Efésios","Filipenses","Colossenses","1Tessalonicenses","2Tessalonicenses","1Timóteo","2Timóteo","Tito","Filemom","Hebreus","Tiago","1Pedro","2Pedro","1João","2João","3João","Judas","Apocalipse"];

const config = require('../config');

const booksdir = config.book.directory;

// const filesbooksdir = fs.readdirSync(booksdir);

const books = [];

// filesbooksdir.map(filename => {

//   const bookcontent = fs.readFileSync(join(booksdir, filename), 'utf8').trim();
//   const book = JSON.parse(bookcontent);
//   books.push(book);
// });

listorderedbooks.forEach(bookname => {
  const bookcontent = fs.readFileSync(join(booksdir, bookname + '.json'), 'utf8').trim();
  const book = JSON.parse(bookcontent);
  books.push(book);
});

fs.writeFile(join(config.allbooks.directory, config.allbooks.filename), JSON.stringify(books), async err => {
  if (err)
    throw err;
  console.log("Livros unificados com sucesso!!");
})