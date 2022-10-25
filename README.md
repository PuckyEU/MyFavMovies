# MyFavMovies
[**MyFavMovies**](https://puckyeu.github.io/MyFavMovies/) is a website, which is made for you to **Discover** what movies or tv shows you would want to watch. It is in a streaming service like fashion, and all results will be **Personalized** depending on **Your Ratings** of previous movies. The website will contain every bit of information you would **need** or **want** to know about the movie like **Release Dates, Cast, Crew** and so on.

## Todo list
- [ ] Remove items from watchlist
- [ ] Show that a movie is already added to watchlist
- [ ] Document how to self-host the firebase server
- [x] Figure out how to decide what movies are relevant to the user

## How will we decide what movies are relevant to you?
I will take all tags on the current movie (for example "based on novel or book" or "based on comic") and the genres of the movie, after that I will put it in a list how many times you've liked that specific genre a tag and what rating you gave it. From that I will find similar movies with similar tags and genres.
