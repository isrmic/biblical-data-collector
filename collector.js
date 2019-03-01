const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const { output, outputln } = require('./utils/output');

const config = require('./config');

// http://www.mundocristao.com.br/:booknumber/:bookname-:chapter/

const URIs = {
	baseurl: 'http://www.mundocristao.com.br/',
	todoslivros: 'http://www.mundocristao.com.br/TodosLivros',
	apibible: 'https://bibleapi.co/api/books', //this uri is to get abbrev and groups of the books
};

const Bibles = {
	versions: {
		nvt: {
			booksnumber: 66,
			books: [],
		},
	},
};

//declare 'global' to access from the other functions
const infobooks = {};

const startCollect = async (startold, startnew) => {

	//select version
	const nvt = Bibles.versions.nvt;

	//load data of books from other API
	const response = await axios.get(URIs.apibible);
	const databooks = response.data;
	
	//re-structured data of book for the best acces data (acces key)
	databooks.map(dtb => {
		infobooks[dtb.name] = dtb;
	});	

	//collect books and chapters number
	{
		outputln('Iniciando coleta de dados ...', 'yellow');
		//request on URI of content
		const response = await axios.get('http://www.mundocristao.com.br/TodosLivros');
		//destructing data from response === response.data
		const { data } = response;

		//load the content html from data response
		const $ = cheerio.load(data);		
				
		//select booklist from data loaded
		const allbooklist = $('section ol.all-books-list');

		//old's represent the content of old testament
		//new's represent the content of new testament

		const oldtestament = $(allbooklist[0]);
		const newtestament = $(allbooklist[1]);

		const _oldlistbooksname = oldtestament.find('li h2'); // 'li h2' is a element of title books
		const _oldbookschapters = oldtestament.find('li div'); // 'li div' is a element of list chapters

		const _newlistbooksname = newtestament.find('li h2'); // 'li h2' is a element of title books
		const _newbookschapters = newtestament.find('li div'); // 'li div' is a element of list chapters
		
		const oldbooks = []; //array to storage all old testament books collected
		const newbooks = []; //array to storage all old testament books collected

		let books = []; //all books of bible

		// Collect of old testament
		outputln('\r\nVelho Testamento');
		for (let i = config.oldtestament.startOfBook - 1; i < _oldlistbooksname.length; i++) {
			
			const bookname = _oldlistbooksname[i].children[0].data.trim();
			output(`Coletando dados do livro: ${bookname} `, 'cyan');
			
			const ulelement = $(_oldbookschapters[i]).find('ul li');
			output(`Capítulos: `, 'yellow');
			outputln(`${ulelement.length} \r\n`);
			
			oldbooks.push(await createNewBook(bookname, ulelement.length, i + 1));
			
		}

		// Collect of new testament
		outputln('\r\nNovo Testamento');
		for (let i = config.newtestament.startOfBook - 1; i < _newlistbooksname.length; i++) {
			
			const bookname = _newlistbooksname[i].children[0].data.trim();
			output(`Coletando dados do livro: ${bookname} `, 'cyan');

			const ulelement = $(_newbookschapters[i]).find('ul li');
			output(`Capítulos: `, 'yellow');
			outputln(`${ulelement.length} \r\n`);
			
			// i = a index of list books new testmanet
			// 39 is a number of books old testament
			// on mundo cristão the books is numerated from 1 at 66
			// the new testament start at 40
			// example: 0 + 39 + 1 = 40 -> first book of new testament
			// third param is a book number
			newbooks.push(await createNewBook(bookname, ulelement.length, (i + 39 + 1) ));
		}
		
		books = [...oldbooks, ...newbooks]; // generate all books with the copy of oldbooks e newbooks using spread operator

		const bookcontentstring = JSON.stringify(books); // transform data to to JSON string

		//save all books content in format .json file
		fs.writeFile(path.join('books', 'nvt.json'), bookcontentstring, async err => {
			outputln(`Coleta de dados terminado, resultado salvo em: ${path.join(__dirname, 'books')}`);
		});		

	}
};

/**
 * 
 * @param {String} bookname //name of book
 * @param {Number} chaptersnumber // number of chapters book
 * @param {Number} booknumber // number that represent the book
 */
const createNewBook = async (bookname, chaptersnumber, booknumber) => {
	
	let totalversicles = 0;

	const infobook = infobooks[bookname];

	//init create of book
	const book = { 
		bookname,
		abbrev: infobook ? infobook.abbrev : '? ? ?',
		author: infobook ? infobook.author : '? ? ?',
		testament: infobook ? infobook.testament : '? ? ?',
		group: infobook ? infobook.group : '? ? ?',
		chaptersnumber,
		chapters: [],
	};
	
	for (let chapternumber = 1; chapternumber <= chaptersnumber; chapternumber++) {
		
		// output(`Coletando capítulo ${chapternumber}`, 'yellow');

		const uri = URIs.baseurl + `${booknumber}/${bookname}-${chapternumber}`;

		const response = await axios.get(uri);

		const { data } = response;
		
		const $ = cheerio.load(data);

		const _versicles = $('#div_print ul.chapter-details-list-verse li'); //list of versicles

		output(`Capítulo: `, 'yellow');
		output(`${chapternumber} `,);
		output(`versículos: `, 'yellow');
		output(`${_versicles.length} `);		
		
		totalversicles += _versicles.length; // number of versicles

		const _versiclescontent = _versicles.find('a p'); // element with content of versicle
		
		//declare with var for access out of the 'for expression'
		var versicles = [];
		
		for (let versiclenumber = 0; versiclenumber < _versicles.length; versiclenumber++) {
			
			const versicle = _versiclescontent[versiclenumber].children[1].data.trim();

			versicles.push(versicle);
		}

		outputln('OK', 'green');

		const chapter = {
			versiclesnumber: _versicles.length,
			versicles,
		};

		book.chapters.push(chapter);

	}
	
	//save each book on separated file;
	const bookcontentstring = JSON.stringify(book);
	
	fs.writeFile(path.join('books', bookname + '.json'), bookcontentstring, async err => {
		output('>> ');
		outputln(`Salvo o livro: ${bookname}, ${chaptersnumber} capítulos, ${totalversicles} versículos\r\n`, 'green');
	});	

	return book;

};

module.exports = startCollect;