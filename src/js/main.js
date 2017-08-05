(function() {
    $(document).ready(function() {
        // Preventing the default actions of button
        // Delegating own tasks to each button
        $('.btn').on('click', function(e) {
            e.preventDefault();
        });

        // Initialize the plugin
        $('#my_popup').popup({
            transition: 'all 0.3s'
        });
        $('#info_popup').popup({
           transition: 'all 0.3s'
        });

        // Binding events to the search button
        $('#search').on('click', function() {
            var query = $('#query').val();

            processQuery(query);
        });

        // Binding events to the view button
        $('tbody').on('click', 'button.info_popup_open', function() {
            var $parent = $(this).parent().parent(),
                isbn = $parent[0].firstChild.attributes[0].nodeValue;

            var title,
                authors,
                publisher,
                publishedDate,
                description,
                pageCount,
                averageRating,
                ratingsCount,
                maturityRating,
                thumbnail,
                previewLink;

            // AJAX to get book's information using Google's Books API based on ISBN
            $.ajax({
                url: 'https://www.googleapis.com/books/v1/volumes?key=AIzaSyCd9u1RXwdaha1U6tEWdqEKdhh3bqnleYQ&q=' + isbn,
                type: 'GET',
                dataType: 'json',
                success: function(data) {
                    var $modal = $('#info_popup div');
                    if (checkUndesired(data.items)) {   // Checking if the data is empty
                        var bookInfo  = data.items[0].volumeInfo;
                        title = bookInfo.title;
                        currTitle = $('.title').text();
                        if (currTitle !== title) {  // Only reloading when necessary (if not same book)
                            $modal.empty()
                                .append('<button class="btn info_popup_close">Close</button>');

                            if (checkUndesired(bookInfo.imageLinks)) {
                                thumbnail = bookInfo.imageLinks.thumbnail;
                                if (checkUndesired(thumbnail)) {
                                    $modal.append('<img class="thumbnail" src="' + thumbnail + '" />');
                                }
                            }

                            if (checkUndesired(title)) {
                                $modal.append('<p class="title">' + title + '</p>');
                            }
                            authors = bookInfo.authors;
                            if (checkUndesired(authors)) {
                                $modal.append('<p class="author">' + authors + '</p>');
                            }

                            publisher = bookInfo.publisher;
                            if (checkUndesired(publisher)) {
                                $modal.append('<p class="publisher">' + publisher + '</p>');
                            }

                            publishedDate = bookInfo.publishedDate;
                            if (checkUndesired(publishedDate)) {
                                $modal.append('<p class="publishedDate">' + publishedDate + '</p>');
                            }

                            description = bookInfo.description;
                            if (checkUndesired(description)) {
                                $modal.append('<p class="description">' + description + '</p>');
                            }

                            pageCount = bookInfo.pageCount;
                            if (checkUndesired(pageCount)) {
                                $modal.append('<p class="pageCount">Page Count: ' + pageCount + '</p>');
                            }

                            averageRating = bookInfo.averageRating;
                            if (checkUndesired(averageRating)) {
                                $modal.append('<p class="averageRating">Average Rating: ' + averageRating + '</p>');
                            }

                            ratingsCount = bookInfo.ratingsCount;
                            if (checkUndesired(ratingsCount)) {
                                $modal.append('<p class="ratingsCount">Ratings Count: ' + ratingsCount + '</p>');
                            }

                            previewLink = bookInfo.previewLink;
                            if (checkUndesired(previewLink)) {
                                $modal.append('<a href="' + previewLink + '" target="_blank">Preview</a>');
                            }
                        }
                    } else {
                        $modal.empty()
                            .append('<button class="btn info_popup_close">Close</button>')
                            .append('<h2>Sorry, no information could be found on this book.</h2>');
                    }
                },
                statusCode: {

                    404: function() {
                        $('#info_popup div').empty()
                            .append('<button class="btn info_popup_close">Close</button>')
                            .append('<h2>Sorry, no information could be found on this book.</h2>');
                    },
                    400: function() {
                        $('#info_popup div').empty()
                            .append('<button class="btn info_popup_close">Close</button>')
                            .append('<h2>Sorry, no information could be found on this book.</h2>');
                    }
                }
            });
        });
    });

    var CLIENT_KEY = 'b980248b-ab5a-4662-8740-00647ec40a15';

    // Method for process the query
    var processQuery = function(query) {
        var url = 'http://search2.abebooks.com/search?clientkey=' + CLIENT_KEY;

        url = parseQuery(query, url);
        url += '&maxresults=20';    // Limiting results for faster response

        // console.log(url);

        // $.ajax({
        //     url: 'http://cors.io/?u=' + encodeURIComponent(url),
        //     type: 'GET',
        //     success: function(data) {
        //         // Determining if results were found
        //         console.log(data);
        //         var dataDoc = $.parseXML(data);
        //         $data = $(dataDoc);
        //         $message = $data.find('resultCount');
        //         if(parseInt($message.text()) > 0) {
        //             $('tbody').empty();
        //             $('table').show();
        //             $('#message').empty();
        //             displayResults(data);
        //         } else {
        //             $('table').hide();
        //             $('tbody').empty();
        //             $('#message').text('Sorry, we could not find books with the provided query. Please try again.');
        //         }
        //     },
        // });

        $.ajax({
            url: 'https://cors-anywhere.herokuapp.com/' + url,
            type: 'GET',
            success: function(data) {
                // Determining if results were found
                var $data = $(data);
                var $message = $data.find('resultCount');
                if(parseInt($message.text()) > 0) {
                    $('tbody').empty();
                    $('table').show();
                    $('#message').empty();
                    displayResultsAlt($data);
                } else {
                    $('table').hide();
                    $('tbody').empty();
                    $('#message').text('Sorry, we could not find books with the provided query. Please try again.');
                }
            },
        });
    };

    // Method to display the results of the query with the alternative cors proxy
    var displayResultsAlt = function(xml) {
        var $books = xml.find('Book');
        var booksLength = $books.length;

        $books.each(function() {
            $book = $(this);

            // Getting necessary book information;
            $isbn = $book.find('isbn10');
            $author = $book.find('author');
            $title = $book.find('title');
            $shippingCost = $book.find('firstBookShipCost');
            $freeShipping = $shippingCost.text() == 0 ? 'Yes' : 'No';
            $itemCondition = $book.find('itemCondition');
            $totalListingPrice = $book.find('totalListingPrice');
            $listingUrl = $book.find('listingUrl');
            $sellerRating = $book.find('sellerRating');

            $('#content-section tbody').append('<tr>' +
                '<td value=' + $isbn.text() + '>' + $title.text() + '</td>' +
                '<td>' + $author.text() + '</td>' +
                '<td>'+ $itemCondition.text() + '</td>' +
                '<td>' + $freeShipping + '</td>' +
                '<td>$' + $totalListingPrice.text() + '</td>' +
                '<td><button class="btn info_popup_open">Details</button></td>' +
                '<td><a href=http://affiliates.abebooks.com/c/229936/77416/2029?u=' + encodeURI($listingUrl.text()) + ' target="_blank">Purcahse</a></td>' +
                '</tr>');
        });
    };

    // Method to display the results of the query
    var displayResults = function(xml) {
        // Creating the XML object
        var xmlDoc = $.parseXML(xml);
        $xml = $(xmlDoc);

        $books = $xml.find('Book');
        var booksLength = $books.length;

        $books.each(function() {
            $book = $(this);

            // Getting necessary book information;
            $isbn = $book.find('isbn10');
            $author = $book.find('author');
            $title = $book.find('title');
            $shippingCost = $book.find('firstBookShipCost');
            $freeShipping = $shippingCost.text() === 0 ? 'Yes' : 'No';
            $itemCondition = $book.find('itemCondition');
            $totalListingPrice = $book.find('totalListingPrice');
            $listingUrl = $book.find('listingUrl');
            $sellerRating = $book.find('sellerRating');


            $('#content-section tbody').append('<tr>' +
                '<td value=' + $isbn.text() + '>' + $title.text() + '</td>' +
                '<td>' + $author.text() + '</td>' +
                '<td>'+ $itemCondition.text() + '</td>' +
                '<td>' + $freeShipping + '</td>' +
                '<td>$' + $totalListingPrice.text() + '</td>' +
                '<td><button class="btn info_popup_open">Details</button></td>' +
                '<td><a href=http://affiliates.abebooks.com/c/229936/77416/2029?u=' + encodeURI($listingUrl.text()) + ' target="_blank">Purcahse</a></td>' +
                '</tr>');
        });
    };

    // Method for parsing queries
    // Returns the updated url as a string
    var parseQuery = function(query, url) {
        var queriesArray = query.toUpperCase().split(' AND ');  // Splitting up the query into predicates
        // console.log(queriesArray);

        for(var i = 0; i < queriesArray.length; i++) {  // Iterating through each predicate
            var currentQuery = queriesArray[i],
                isTitle = true,
                conditionFound = false,
                bindingFound = false;

            // Query by ISBN
            if (checkISBN(currentQuery.toUpperCase())) {
                url += '&isbn=' + currentQuery;
                isTitle = false;
            }

            // Query by Author
            if (checkAuthor(currentQuery.toUpperCase())) {
                var queryStart = currentQuery.indexOf('WRITTEN BY') + 'WRITTEN BY'.length + 1,      // The start of the author's name
                    queryEnd = queryStart.length;                                                   // The end of the author's name

                var authorArray = (currentQuery.substr(queryStart, queryEnd)).split(' ');   // Splitting in order to add '+' to url
                url += '&author=' + authorArray[0];
                for (var j = 1; j < authorArray.length; j++) {
                    url += '+' + authorArray[j];
                }
                isTitle = false;
            }

            // Query by genre / keyword and book condition and book binding
            if (checkKeyword(currentQuery.toUpperCase())) {
                var keywordsArray = currentQuery.substr(0, currentQuery.toUpperCase().indexOf('BOOK')).split(' '); // Splitting in order to separate keywords

                if (keywordsArray[0].indexOf('NEW') >= 0) {
                    url += '&bookcondition=newonly';
                    conditionFound = true;
                } else if (keywordsArray[0].indexOf('USED') >= 0) {
                    url += '&bookcondition=usedonly';
                    conditionFound = true;
                } else if (keywordsArray[0].indexOf('HARDCOVER') >= 0) {
                    url += '&binding=hardcover';
                    bindingFound = true;
                } else if (keywordsArray[0].toUpperCase().indexOf('SOFTCOVER') >= 0) {
                    url += '&binding=softcover';
                    bindingFound = true;
                } else {
                    url += '&keyword=' + keywordsArray[0];
                    for (var j = 1; j < keywordsArray.length - 1; j++) { // -1 the length for not checking the extra "" in the array
                        url += '+' + keywordsArray[j];
                    }
                }

                isTitle = false;
            }

            // Query by publisher
            if (checkPublisher(currentQuery.toUpperCase())) {
                var queryStart = currentQuery.indexOf('PUBLISHED BY') + 'PUBLISHED BY'.length + 1, // The start of the publisher's name
                queryEnd = currentQuery.length;

                var publisherArray = currentQuery.substr(queryStart, queryEnd).split(' '); // Splitting in order to add '+' to url
                url += '&pubname=' + publisherArray[0];
                for (var j = 1; j < publisherArray.length; j++) {
                    url += '+' + publisherArray[j];
                }
                isTitle = false;
            }

            // Query by publishing year
            if (checkPublishingYear(currentQuery.toUpperCase())) {
                if (currentQuery.indexOf('BEFORE') > 0) {
                    var queryStart = currentQuery.indexOf('BEFORE') + 'BEFORE'.length + 1; // The start of the publishing year

                    var publishingYear = currentQuery.substr(queryStart, 4);

                    url += '&maxpubyear=' + publishingYear;
                } else {
                    var queryStart = currentQuery.indexOf('AFTER') + 'AFTER'.length + 1; // The start of the publishing year

                    var publishingYear = currentQuery.substr(queryStart, 4);
                    url += '&minpubyear=' + publishingYear;
                }
                isTitle = false;
            }

            // Query by max price
            if (checkMaxPrice(currentQuery.toUpperCase())) {
                var queryStart = currentQuery.indexOf('LESS THAN $') + 'LESS THAN $'.length, // The start of the max price
                    queryEnd = currentQuery.length;

                var maxPrice = parseInt(currentQuery.substr(queryStart, queryEnd), 10); // Converting the string / float to an integer
                url += '&maxprice=' + maxPrice;
                isTitle = false;
            }

            // Query by book condition
            if (!conditionFound && checkCondition(currentQuery.toUpperCase())) {
                if (currentQuery.indexOf('IS NEW') >= 0) {
                    url += '&bookcondition=newonly';
                } else {
                    url += '&bookcondition=usedonly';
                }

                isTitle = false;
            }

            // Query by book binding type
            if (!bindingFound && checkBinding(currentQuery.toUpperCase())) {
                if (currentQuery.indexOf('SOFTCOVER') >= 0) {
                    url += '&binding=softcover';
                } else {
                    url += '&binding=hardcover';
                }

                isTitle = false;
            }

            // Query by signed
            if (isSigned(currentQuery.toUpperCase())) {
                url += '&signed=yes';

                isTitle = false;
            }

            // Query by shipping option
            if (hasFreeShipping(currentQuery.toUpperCase())) {
                url += '&freeshipping=yes';

                isTitle = false;
            }

            // Query by Title
            if (isTitle) {
                var title = currentQuery.replace(/ /g, '+'); // Replacing all spaces with '+' for the url
                url += '&title=' + title;
            }
        }

        return url;
    };

    // Method to check if the query is an ISBN
    // Returns true if it is an ISBN, returns false otherwise
    var checkISBN = function(query) {
        // Removes '-' before checking in case user entered ISBN-13
        if (/^\d+$/.test(query.replace('-', ''))) {
            return true;
        }

        return false;
    };

    // Method for checking if an author was specified
    // Returns true if an author is specified, returns false otherwise
    var checkAuthor = function(query) {
        if (query.indexOf('WRITTEN BY') >= 0) {
            return true;
        }

        return false;
    };

    // Method for checking if a keyword was specified
    // Returns true if a keyword was specified, returns false otherwise
    var checkKeyword = function(query) {
        if (query.indexOf('BOOK') > 0) {
            return true;
        }

        return false;
    };

    // Method for checking if a publisher was specified
    // Returns true if a publisher was specified, returns false otherwise
    var checkPublisher = function(query) {
        if (query.indexOf('PUBLISHED BY') >= 0) {
            return true;
        }

        return false;
    };

    // Method for checking if a publishing year was specified
    // Returns true if a publisher was specified, returns false otherwise
    var checkPublishingYear = function(query) {
        if (query.indexOf('PUBLISHED BEFORE') >= 0 || query.indexOf('PUBLISHED AFTER') >= 0) {
            return true;
        }

        return false;
    };

    // Method for checking if a maximum price was specified
    // Returns true if a maximum price was specified, returns false otherwise
    var checkMaxPrice = function(query) {
        if (query.indexOf('LESS THAN') >= 0) {
            return true;
        }

        return false;
    };

    // Method for checking if a book condition was specified
    // Returns true if a book condition was specified, returns false otherwise
    var checkCondition = function(query) {
        if (query.indexOf('IS NEW') >= 0 || query.indexOf('IS USED') >= 0) {
             return true;
        }

        return false;
    };

    // Method for checking if a book binding type was specified
    // Returns true if a binding type was specified, returns false otherwise
    var checkBinding = function(query) {
        if (query.indexOf('SOFTCOVER') >= 0 || query.indexOf('HARDCOVER') >= 0) {
            return true;
        }

        return false;
    };

    // Method for checking whether a signed book was specified
    // Returns true if there is a signed condition, returns false otherwise
    var isSigned = function(query) {
        if (query.indexOf('IS SIGNED') >= 0) {
            return true;
        }

        return false;
    };

    // Method for checking if free shipping was specified
    // Returns true if free shipping was a condition, returns false otherwise
    var hasFreeShipping = function(query) {
        if (query.indexOf('FREE SHIPPING') >= 0) {
            return true;
        }

        return false;
    };

    // Method for checking if a variable is empty, null, or undefined
    var checkUndesired = function(variable) {
        if (typeof variable === undefined || variable === '' || variable === ' ' || variable  === null || variable === undefined || variable === 'undefined' || variable === 'null') {
            return false;
        }

        return true;
    }
}());
