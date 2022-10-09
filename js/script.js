document.addEventListener("DOMContentLoaded", function(){

    // get form
    const submitForm = document.getElementById('form');

    submitForm.addEventListener("submit", function(event){
        event.preventDefault();
        addBook();
    });

    // make function addBook
    function addBook() {
        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const year = document.getElementById('year').value;

        const generatedID = generateId();
        const bookObject = generateBookObject(generatedID, title, author, year, false);
        books.push(bookObject);

        // 
        // console.log(books);

        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
        // console.log(localStorage.getItem(STORAGE_KEY));
        
        toast('Buku '+title+' Berhasil Ditambahkan !');
    }

    // toast
    function toast(message) {
        let s = document.getElementById('toast');
        s.innerHTML = message;
        s.classList.add('show');
        setTimeout(()=> {
            s.classList.remove('show')
        },3000);
    }
            

    // generate id
    function generateId() {
        return +new Date();
    }

    // generate objek
    function generateBookObject(id, title, author, year, isCompleted) {
        return {
            id,
            title,
            author,
            year,
            isCompleted
        }
    }

    // membuat variabel
    const books = [];
    const RENDER_EVENT = 'render-book';

    // membuat custom event
    document.addEventListener(RENDER_EVENT, function () {
        // tampilkan di console data local setiap pertama kali load
        // console.log(books);

        // setelah fungsi untuk menampilkan todo sudah jadi maka console.log tidak diperlukan
        const uncompletedBOOKList = document.getElementById('books');
        uncompletedBOOKList.innerHTML = '';
 
        const completedBOOKList = document.getElementById('completed-books');
        completedBOOKList.innerHTML = '';
        
        for (const book of books) {
            const bookElement = makeBook(book);
            if (!book.isCompleted)
                uncompletedBOOKList.append(bookElement);
            else
                completedBOOKList.append(bookElement);
        }

    });

    // ----------------------------------------------------------------
    // membuat pencarian 
    const searchButton = document.getElementById('search-button');
    const searchForm = document.getElementById('search');

    searchForm.addEventListener("submit", function(event){
        event.preventDefault();
        const searchField = document.getElementById('search-field').value;
        const keyword = searchField.toLowerCase();
        // 
        console.log(keyword);

        const uncompletedBOOKList = document.getElementById('books');
        uncompletedBOOKList.innerHTML = '';

        const completedBOOKList = document.getElementById('completed-books');
        completedBOOKList.innerHTML = '';
        
        var b = searchField || '';
        if(searchField == ''){
            document.dispatchEvent(new Event(RENDER_EVENT));
        }else{
            for (const book of books) {
                const bookElement = makeBook(book);
                if (!book.isCompleted){
                    if(book.title.toLowerCase() == keyword){
                        uncompletedBOOKList.append(bookElement);
                    }else{
                        uncompletedBOOKList.innerHTML = 'Tidak ditemukan, harap masukkan judul lengkap';
                    }
                }
                else if(book.isCompleted){
                    if(book.title.toLowerCase() == keyword){
                        completedBOOKList.append(bookElement);
                    }else{
                        completedBOOKList.innerHTML = 'Tidak ditemukan, harap masukkan judul lengkap';
                    }
                }
            }
        }
        
    });

        

    // ----------------------------------------------------------------

    // add to do
    function makeBook(bookObject) {
        const textTitle = document.createElement('h2');
        textTitle.innerText = bookObject.title;

        const textAuthor = document.createElement('p');
        textAuthor.innerText = "Penulis : " + bookObject.author;

        const textTimestamp = document.createElement('small');
        textTimestamp.innerText = "Tahun " + bookObject.year;

        const textContainer = document.createElement('div');
        textContainer.classList.add('inner');
        textContainer.append(textTitle, textAuthor, textTimestamp);

        const container = document.createElement('div');
        container.classList.add('item', 'shadow');
        container.append(textContainer);
        container.setAttribute('id', `todo-${bookObject.id}`);

        // pengecekan
        if (bookObject.isCompleted) {
            const undoButton = document.createElement('button');
            undoButton.classList.add('undo-button');

            undoButton.addEventListener('click', function () {
                undoTaskFromCompleted(bookObject.id);
            });

            const trashButton = document.createElement('button');
            trashButton.classList.add('trash-button');
        
            trashButton.addEventListener('click', function () {
                let confirmToDelete = confirm('Yakin Ingin Menghapus Buku '+bookObject.title+' ?');
                if(confirmToDelete){
                    removeTaskFromCompleted(bookObject.id);
                }else{
                    toast('Buku Tidak Jadi dihapus !');
                }
            });
        
            container.append(undoButton, trashButton);
        } else {
            const checkButton = document.createElement('button');
            checkButton.classList.add('check-button');

            const trashButton = document.createElement('button');
            trashButton.classList.add('trash-button');
        
            trashButton.addEventListener('click', function () {
                let confirmToDelete2 = confirm('Yakin Ingin Menghapus Buku '+bookObject.title+' ?');
                if(confirmToDelete2){
                    removeTaskFromCompleted(bookObject.id);
                }else{
                    toast('Buku Tidak Jadi dihapus !');
                }
            });
            
            checkButton.addEventListener('click', function () {
                addTaskToCompleted(bookObject.id);
            });
            
            container.append(checkButton, trashButton);
        }

        return container;
    }


    function addTaskToCompleted (bookId) {
        const bookTarget = findTodo(bookId);

        if (bookTarget == null) return;
    
        bookTarget.isCompleted = true;
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
        toast('Buku '+bookTarget.title+' ditandai telah dibaca !');
    }

    function findTodo(bookId) {
        for (const todoItem of books) {
            if (todoItem.id === bookId) {
                return todoItem;
            }
        }
        return null;
    }

    function removeTaskFromCompleted(bookId) {
        const bookTarget = findTodoIndex(bookId);
    
        if (bookTarget === -1) return;
    
        books.splice(bookTarget, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        toast('Buku telah dihapus dari list buku anda !');
        saveData();
    }

    function undoTaskFromCompleted(bookId) {
        const bookTarget = findTodo(bookId);
    
        if (bookTarget == null) return;

        bookTarget.isCompleted = false;
        document.dispatchEvent(new Event(RENDER_EVENT));
        toast('Buku '+bookTarget.title+' dikembalikan kedalam list belum dibaca !');
        saveData();
    }

    function findTodoIndex(bookId) {
        for (const index in books) {
            if (books[index].id === bookId) {
                return index;
            }
        }
    
        return -1;
    }

    function saveData() {
        if (isStorageExist()) {
            const parsed = JSON.stringify(books);
            localStorage.setItem(STORAGE_KEY, parsed);
            document.dispatchEvent(new Event(SAVED_EVENT));
        }
    }

    const SAVED_EVENT = 'saved-book';
    const STORAGE_KEY = 'BOOK_APPS';


    function loadDataFromStorage() {
        const serializedData = localStorage.getItem(STORAGE_KEY);
        let data = JSON.parse(serializedData);
    
        if (data !== null) {
          for (const todo of data) {
            books.push(todo);
          }
        }
       
        document.dispatchEvent(new Event(RENDER_EVENT));
      }

    if (isStorageExist()) {
        loadDataFromStorage();
    }

    function isStorageExist() /* boolean */ {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
        return true;
    }

});


