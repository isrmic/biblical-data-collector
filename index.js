const axios = require('axios');
const cheerio = require('cheerio');

const structure = require('./structure.biblical.data');

/* http://www.mundocristao.com.br/:booknumber/:bookname-:chapter/ */
const baseurl = 'http://www.mundocristao.com.br';

const books = structure.version.nvt.books;

Object.keys(books).forEach(keybook => {

	const book = books[keybook];

	Object.keys(book.chapters).forEach(async keychapter => {

		const chapter = book.chapters[keychapter];

		const response = await axios.get(`http://www.mundocristao.com.br/${keybook}/${book.bookname}-${keychapter}`);
		const { data } = response;
		
		const $ = cheerio.load(data);

		const versicles = $('.chapter-details-list-verse li a p');

		for (let numberversicle = 0; numberversicle < chapter.versiclesnumber; numberversicle++) {
			
			const versicle = versicles[numberversicle];
			const content = versicle.children[1];
			const contentdata = content.data;
			
			console.log('Book: ', book.bookname, 'chapter: ', keychapter, 'versicle: ', numberversicle + 1);
			console.log('content: ', contentdata);
			console.log('\r\n');
		}

	});
});