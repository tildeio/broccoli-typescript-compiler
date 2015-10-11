import Helper = require('./Helper');
const {expect, sinon} = Helper;

import ts = require('typescript');
import BFLanguageServiceHost = require("../lib/BFLanguageServiceHost");

describe('BFLanguageServiceHost', function() {
	let subject: BFLanguageServiceHost;

	const cwd = "the directory";
	const options: ts.CompilerOptions = { id: "the compiler options" };
	const defaultLibFileName = 'the filename';
	const defaultFileContents = 'the file content';
	const defaultContents = 'the content';
	let tsMock: {
		getDefaultLibFileName(options: ts.CompilerOptions),
		ScriptSnapshot: {
			fromString(contents: string)
		}
	};
	let fsMock: {
		existsSync(fileName: string),
		readFileSync(fileName: string)
	};

	beforeEach(function() {
		tsMock = {
			getDefaultLibFileName: sinon.stub().returns(defaultLibFileName),
			ScriptSnapshot: {
				fromString: sinon.stub().returns(defaultContents)
			}
		};

		fsMock = {
			existsSync: sinon.stub().returns(true),
			readFileSync: sinon.stub().returns(defaultFileContents)
		};
	});

	describe('#getCompilationSettings', function() {
		it('returns the compilation settings', function() {
			subject = new BFLanguageServiceHost(options, cwd, {});
			expect(subject.getCompilationSettings()).to.eql(options);
		});
	});

	describe('#getScriptFileNames', function() {
		it('returns the filenames registered', function() {
			const fileRegistry: TSFileRegistry = {};
			const pathA = 'pathA';
			const pathB = 'pathB';

			subject = new BFLanguageServiceHost(options, cwd, fileRegistry);

			// At start
			expect(subject.getScriptFileNames()).to.eql([]);

			// Add some files
			fileRegistry[pathA] = { version: 0 };
			fileRegistry[pathB] = { version: 0 };
			expect(subject.getScriptFileNames()).to.eql([pathA, pathB]);

			// Remove a file
			delete fileRegistry[pathA];
			expect(subject.getScriptFileNames()).to.eql([pathB]);
		});
	});

	describe('#getScriptVersion', function() {
		let subject: BFLanguageServiceHost;
		let fileRegistry: TSFileRegistry;
		const path = 'the path';
		const unknownPath = 'unknown path';
		const version = 1337;

		beforeEach(function() {
			fileRegistry = {};
			fileRegistry[path] = {
				version
			}
			subject = new BFLanguageServiceHost(options, cwd, fileRegistry);
		});

		context('registry entry exists', function() {
			it('returns the version', function() {
				expect(subject.getScriptVersion(path)).to.eql(version.toString());
			});
		});

		context('registry entry does not exist', function() {
			it('adds a file entry', function() {
				subject.getScriptVersion(unknownPath);
				expect(fileRegistry[unknownPath]).to.not.eql(undefined);
			});

			it('returns the version', function() {
				expect(subject.getScriptVersion(unknownPath)).to.eql("0");
			});
		});
	});

	describe('#getScriptSnapshot', function() {
		context('the file does not exist', function() {
			it('should return undefined', function() {
				(<Sinon.SinonStub>fsMock.existsSync).returns(false);
				subject = new BFLanguageServiceHost(options, cwd, {}, <any>tsMock, <any>fsMock);
				expect(subject.getScriptSnapshot("blah")).to.eql(undefined);
			});
		});

		context('the file exists', function() {
			it('should return the script snapshot', function() {
				subject = new BFLanguageServiceHost(options, cwd, {}, <any>tsMock, <any>fsMock);
				expect(subject.getScriptSnapshot("blah")).to.eql(defaultContents);
				expect(tsMock.ScriptSnapshot.fromString).to.have.been.calledWithExactly(defaultFileContents);
			});
		});
	});

	describe('#getCurrentDirectory', function() {
		it('returns the cwd', function() {
			subject = new BFLanguageServiceHost(options, cwd, {});
			expect(subject.getCurrentDirectory()).to.eql(cwd);
		});
	});

	describe('#getDefaultLibName', function() {
		it('delegates to ts', function() {
			subject = new BFLanguageServiceHost(options, cwd, {}, <any>tsMock);

			expect(subject.getDefaultLibFileName(options)).to.eql(defaultLibFileName);
			expect(tsMock.getDefaultLibFileName).to.have.been.calledWithExactly(options);
		});
	});
});