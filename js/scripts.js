const API_KEY_v4 = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyN2JhZDFiYTRkM2UwYzVjOWQ3MWRlMjkzZWMxOTgxNSIsInN1YiI6IjYyYjI1ZGNkMjQ1ZGJlMDA4YWM3MTQyYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.uJ6G4MQ9CIt0LS7Nqc5oP_H97VOlpunpduPvEeWD0R8';
        const API_KEY_v3 = '27bad1ba4d3e0c5c9d71de293ec19815';
        const ROOT_API_ENDPOINT = 'https://api.themoviedb.org/3';
        const ROOT_IMAGE_ENDPOINT = 'https://image.tmdb.org/t/p/original/';
        
        let genres = {};
        let movies = {};
        let current_movies_page = 0;

        const handleMovies = (movies_api_result) => {
            console.log(movies_api_result);
            movies_api_result.results.forEach(movie => {
                movies[movie.id] = movie;
            });
            console.log(movies);
        }

        const handleGenres = (genres_api_result) => {
            console.log(genres_api_result);
            genres_api_result.genres.forEach(genre => {
                genres[genre.id] = genre;
            });
            console.log(genres);
        }

        const loadDataToPage = () => {
            const templateCard = $("#templateCardFilme");
            let cardAtual, movieAtual, badges;
            for(movieKey in movies){
                movieAtual = movies[movieKey];
                if(movieAtual.movie_loaded) continue;

                cardAtual =  templateCard.clone();
                badges = '';
                cardAtual.removeClass('d-none');
                cardAtual.find(".card").attr("data-filme-id", movieAtual.id);
                cardAtual.find("img").attr("src", `${ROOT_IMAGE_ENDPOINT}${movieAtual.poster_path}?api_key=${API_KEY_v3}`).attr("alt", movieAtual.title);
                cardAtual.find(".card-text").html(`<b>${movieAtual.title}</b>`);
                badges = movieAtual.genre_ids.reduce((fullText, currentGenre) => {
                    fullText += `<span class="badge badge-primary text-dark">${genres[currentGenre].name}</span>`
                    return fullText;
                }, '');
                cardAtual.find(".card-footer").append('<b>Lançamento:</b> ' + moment(movieAtual.release_date).format('DD/MM/YYYY') + '<br><b>Gênero(s): </b>');
                cardAtual.find(".card-footer").append(badges == '' ? 'Nenhum gênero encontrado' : badges);
                $(cardAtual).appendTo("#filmes");
                movies[movieKey].movie_loaded = true;
            }
            $("#btnMoreMovies").removeClass("d-none");
            $("#spinnerMovies").addClass("d-none");
            $(".card-filme .card").unbind('click');
            $(".card-filme .card").click(handleClickFilme);
        }

        const handleClickFilme = (event) => {
            event.preventDefault();
            const movieId = $(event.currentTarget).attr("data-filme-id");
            window.location = 'detalhe.html?movieId=' + movieId;
        }

        const generateMoviesRequestConfig = (pageIndex = 1) => {
            return {
                url: `${ROOT_API_ENDPOINT}/movie/now_playing`,
                headers: {
                    'Authorization': `Bearer ${API_KEY_v4}`
                },
                data: {
                    region: 'BR',
                    language: 'pt-BR',
                    page: pageIndex
                },
                method: 'GET',
                dataType: 'json',
                success: handleMovies
            }
        }

        const generateGenresRequestConfig = () => {
            return {
                url: `${ROOT_API_ENDPOINT}/genre/movie/list`,
                headers: {
                    'Authorization': `Bearer ${API_KEY_v4}`
                },
                data: {
                    language: 'pt-BR'
                },
                method: 'GET',
                dataType: 'json',
                success: handleGenres
            }
        }

        const getMoreMovies = () => {
            $("#spinnerMovies").removeClass("d-none");
            Promise.all([
                $.ajax(generateMoviesRequestConfig(++current_movies_page)),
                $.ajax(generateGenresRequestConfig())
            ]).then(values => {
                loadDataToPage();
            })
        }


        
        $(document).ready(() => {
            getMoreMovies();
            $("#btnMoreMovies").click(getMoreMovies);
        });
