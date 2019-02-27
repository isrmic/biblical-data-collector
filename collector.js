const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const { output, outputln } = require('./utils/output');

const URIs = {
	baseurl: 'http://www.mundocristao.com.br/',
	todoslivros: 'http://www.mundocristao.com.br/TodosLivros',
};

const Bibles = {
	versions: {
		nvt: {
			books: [],
		},
	},
};

const requestCollect = async () => {

	//select version
	const nvt = Bibles.versions.nvt;

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
		const oldtestament = $(allbooklist[0]);
		const newtestament = $(allbooklist[1]);

		const _oldlistbooksname = oldtestament.find('li h2');
		const _oldbookschapters = oldtestament.find('li div');		

		const _newlistbooksname = newtestament.find('li h2');
		const _newbookschapters = newtestament.find('li div');
		
		const oldbooks = [];
		const newbooks = [];

		let books = [];

		for (let i = 0; i < _oldlistbooksname.length; i++) {
			
			const bookname = _oldlistbooksname[i].children[0].data.trim();
			output(`\r\nColetando dados do livro: ${bookname} `, 'cyan');
			
			const ulelement = $(_oldbookschapters[i]).find('ul li');
			output(`Capítulos: `, 'yellow');
			outputln(`${ulelement.length} \r\n`);
			oldbooks.push(await createNewBook(bookname, ulelement.length, i + 1));
			
		}

		for (let i = 0; i < _newlistbooksname.length; i++) {
			
			const bookname = _newlistbooksname[i].children[0].data.trim();

			const ulelement = $(_newbookschapters[i]).find('ul li');

			newbooks.push(await createNewBook(bookname, ulelement.length, i + 1));
		}
		
		books = [...oldbooks, ...newbooks];

		const bookcontentstring = JSON.stringify(books);

		fs.writeFile(path.join('books', 'nvt.json'), bookcontentstring, async err => {
			outputln(`Coleta de dados terminado, resultado salvo em: ${path.join(__dirname, 'books')}`);
		});		

	}
};

const createNewBook = async (bookname, chaptersnumber, booknumber) => {
	
	let totalversicles = 0;

	const book = { bookname, chaptersnumber, chapters: [], };
	
	for (let chapternumber = 1; chapternumber <= chaptersnumber; chapternumber++) {
		
		// output(`Coletando capítulo ${chapternumber}`, 'yellow');

		const uri = URIs.baseurl + `${booknumber}/${bookname}-${chapternumber}`;
		
		const response = await axios.get(uri);

		const { data } = response;
		
		const $ = cheerio.load(data);

		const _versicles = $('#div_print ul.chapter-details-list-verse li');
		output(`Capítulo: `, 'yellow');
		output(`${chapternumber} `,);
		output(`versículos: `, 'yellow');
		output(`${_versicles.length} `);		
		
		totalversicles += _versicles.length;

		const _versiclescontent = _versicles.find('a p');
		
		//declare with var for access out for expression
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
	
	//save each book separated;
	const bookcontentstring = JSON.stringify(book);
	
	fs.writeFile(path.join('books', bookname + '.json'), bookcontentstring, async err => {
		output('>> ');
		outputln(`Salvo o livro: ${bookname}, ${chaptersnumber} capítulos, ${totalversicles} versículos\r\n`, 'green');
	});	

	return book;

};

requestCollect();