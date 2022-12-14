import Layout from "./Layout";
import React, {useEffect, useState} from "react";
import {Alert, Collapse, IconButton} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {auth, db} from "../firebase";
import {collection, doc, getDocs, setDoc} from "firebase/firestore";
import {Link, useParams} from "react-router-dom";
import {MdCancel, MdOutlineAdd, MdSearch} from "react-icons/md";
import axios from "axios";
import requests from "../Constants";
import {getResultType} from "./Search";
import {delay} from "./Settings";
import {HiChevronDown, HiChevronUp} from "react-icons/hi";

export default function ListPage({isNew, preview}) {
    let { nameQ } = useParams();
    const [name, setName] = useState(!isNew ? nameQ : '');
    const [description, setDescription] = useState('');
    const [backdrop, setBackdrop] = useState('');
    const [movieSearchQuery, setMovieSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [addedMovies, setAddedMovies] = useState([]);
    const [error, setError] = useState('');
    const [isErrorOpen, setIsErrorOpen] = useState(false);
    const [success, setSuccess] = useState('');
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

    useEffect(() => {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                setIsUserLoggedIn(true);

                let list = [];
                const listSnapshot = await getDocs(collection(db, "users", auth.currentUser.uid.toString(), "lists"));
                listSnapshot.forEach((doc) => {
                    if (doc.data().name === nameQ) {
                        list.push(doc.data());
                        setDescription(doc.data().description);
                        setBackdrop(doc.data().backdrop);
                        setAddedMovies(doc.data().movies);
                    }
                });
                console.log(list);
            } else {
                setIsUserLoggedIn(false);
            }
            setIsLoading(false);
        });
    }, [nameQ]);

    function setNameHandler(ev) {
        setName(ev.target.value);
    }
    function setDescriptionHandler(ev) {
        setDescription(ev.target.value);
    }
    function setBackdropHandler(ev) {
        setBackdrop(ev.target.value);
    }
    function setMovieSearchQueryHandler(ev) {
        setMovieSearchQuery(ev.target.value);
    }

    async function submit() {
        if (name === '') {
            setError("Name is Required!");
            setIsErrorOpen(true);
            return;
        }

        const user = auth.currentUser.uid.toString().trim();
        try {
            await setDoc(doc(db, "users", user, "lists", name.toString()), {
                name: name,
                description: description,
                backdrop: backdrop,
                movies: addedMovies
            });
            setSuccess(isNew ? `Successfully Created or Edited the List under the name: ${name}` : `Successfully Edited the List under the name: ${name}`);
            setIsSuccessOpen(true);
            await delay(5000);
            setIsSuccessOpen(false);
        } catch (e) {
            console.error("Error adding document: ", e);
            setError(e);
            setIsErrorOpen(true);
        }
    }

    function removeItem(id) {
        let copy = [...addedMovies];
        copy.splice(id, 1);
        setAddedMovies(copy);
    }
    function addItem(item) {
        let copy = [...addedMovies];
        copy.push(item);
        setAddedMovies(copy);
    }

    async function search(query) {
        if (query === null || query === undefined || query === '') return;

        let quickAdd = false;
        if (query.at(0) === "'" && query.at(query.length - 1) === "'") quickAdd = true;

        if (!quickAdd) {
            const searchRequest = `https://api.themoviedb.org/3/search/multi?api_key=${requests.key}&language=${document.getElementById("root")?.getAttribute('langvalue')}&query=${query}&include_adult=true`;
            axios.get(searchRequest).then((response) => {
                setSearchResults(response.data.results);
            }).then(() => {
                setIsLoading(false);
            }).catch((err) => console.error(err))
        } else {
            const splitStrings = query.substring(1, query.length - 1).split(",");
            let results = [];
            let length = splitStrings.length;
            if (splitStrings.length >= 10) length = 10;
            console.log(length);
            for (let i = 0; i < length; i++) {
                if (splitStrings[i] === "" || isNaN(splitStrings[i].substring(1, splitStrings[i].length))) {
                    continue;
                }
                let request;
                const mediaId = splitStrings[i].substring(1, splitStrings[i].length);
                switch (splitStrings[i].at(0)) {
                    case "m":
                        request = `https://api.themoviedb.org/3/movie/${mediaId}?api_key=${requests.key}&language=${document.getElementById("root")?.getAttribute('langvalue')}`;
                        break;
                    case "t":
                        request = `https://api.themoviedb.org/3/tv/${mediaId}?api_key=${requests.key}&language=${document.getElementById("root")?.getAttribute('langvalue')}`;
                        break;
                    case "p":
                        request = `https://api.themoviedb.org/3/person/${mediaId}?api_key=${requests.key}&language=${document.getElementById("root")?.getAttribute('langvalue')}`;
                        break;
                    default:
                        continue;
                }
                axios.get(request).then((response) => {
                    const info = {};
                    info.id = response.data.id;
                    if (response.data.title) info.title = response.data.title;
                    if (response.data.name) info.name = response.data.name;
                    if (response.data.poster_path) info.poster_path = response.data.poster_path;
                    if (response.data.profile_path) info.profile_path = response.data.profile_path;
                    if (response.data.backdrop_path) info.backdrop_path = response.data.backdrop_path;
                    if (response.data.release_date) info.release_date = response.data.release_date;
                    if (response.data.overview) info.overview = response.data.overview;
                    if (response.data.biography) info.biography = response.data.biography;
                    results.push(info);
                }).catch((err) => console.error(err))
            }
            addedMovies.map((item) => {
                results.push(item);
            })
            setAddedMovies(results);
        }
    }

    function moveElement(id, up) {
        if (up === true && id === 0) return;
        if (up === false && id + 1 === addedMovies.length) return;
        let swapped = addedMovies.swap(id, up === true ? id - 1 : id + 1);
        setAddedMovies(swapped);
    }

    // eslint-disable-next-line
    Array.prototype.swap = function (x,y) {
        let b = this[x];
        this[x] = this[y];
        this[y] = b;
        return this;
    }

    if (!isUserLoggedIn) return <Layout><Link to="/login/"><div className="h-[100vh] font-bold text-[4vh]">Please Log in to Edit Lists</div></Link></Layout>

    return (
        !isLoading && <Layout>
            <div className="min-h-[100vh] h-fit w-[70%] ml-auto mr-auto">
                <div className="text-[4vh] text-center font-bold">{isNew ? "Create a New List" : !preview ? "Edit " + name : name}</div>
                <Link to={!preview ? `/list/${name}/` : `/edit-list/${name}/`} className="text-[2vh] text-[#838383] text-center italic mb-5">{isNew ? "" : !preview ? "Click here to preview " + name : "Click here to edit " + name}</Link>
                {preview ? <textarea className="text-[3vh] text-[#838383] text-center italic mb-5 bg-[#131313] w-full h-[16vh]" name="list_description" style={{resize: "none"}} cols="40" rows="5" onChange={setDescriptionHandler} disabled value={description} placeholder="My Favorite Movies"></textarea> : null}
                {error ? <Collapse in={isErrorOpen}><Alert className="mt-2" variant="filled" severity="error" action={<IconButton size="small" onClick={() => setIsErrorOpen(false)}><CloseIcon fontSize="inherit"/></IconButton>}>{error.toString()}</Alert></Collapse> : null}
                {!preview ? <form>
                    <div className="text-left font-bold mb-2 text-[3vh]">Name *</div>
                    <input className="text_field w-full h-[6vh]" type="text" onChange={setNameHandler} value={name} placeholder="My Awesome List"/>
                    <div className="text-left font-bold mb-2 text-[3vh]">Description</div>
                    <textarea className="text_field w-full h-[16vh]" name="list_description" cols="40" rows="5" onChange={setDescriptionHandler} value={description} placeholder="My Favorite Movies"></textarea>
                    <div className="text-left font-bold mb-2 text-[3vh]">Backdrop Link</div>
                    <input className="text_field w-full h-[6vh]" type="text" placeholder="https://example.com/" onChange={setBackdropHandler} value={backdrop}/>
                    <div className="text-left font-bold text-[3vh]">Add Items</div>
                    <div className="text-left text-[#838383] italic mb-2 mt-[-0.25rem] text-[2vh]">To quickly add items, write the type ("m" for movie, "t" for tv, "p" for person) and their ID in apostrophes. If you want to add multiple, separate them with a comma, e.g. 'm157336,m238,p976'. Limit is 10 items at a time</div>
                    <div className="flex"><input className="text_field w-full h-[6vh] mr-1" type="text" placeholder="Interstellar" onChange={setMovieSearchQueryHandler} value={movieSearchQuery}/><div className="w-fit h-[6vh] search-button button cursor-pointer" onClick={() => search(movieSearchQuery)}><MdSearch className="w-full h-full"/></div><div className="w-[0.25rem]"/><div className="w-fit h-[6vh] search-button button cursor-pointer" onClick={() => setSearchResults(null)}><MdCancel className="w-full h-full"/></div></div>
                    {searchResults?.map((item, id) => (
                        <div className="flex_center relative"><div className="w-[10%] h-[40vh] cursor-pointer flex_center" onClick={() => addItem(item)}><MdOutlineAdd/></div>{getResultType(item, id)}</div>
                    ))}
                    <div className="text-left font-bold mb-2 text-[3vh]">Added Items</div>
                    {addedMovies?.map((item, id) => (
                        <div key={id} className="text-left font-bold mb-4 h-[6vh] flex items-center">
                            <HiChevronUp className="h-[3vh] w-[3vh] cursor-pointer" onClick={() => moveElement(id, true)}/>
                            <HiChevronDown className="h-[3vh] w-[3vh] cursor-pointer" onClick={() => moveElement(id, false)}/>
                            {item?.title ? item?.title : item?.name}
                            <MdCancel className="ml-2 w-[2vh] h-[2vh] cursor-pointer" onClick={() => removeItem(id)}/></div>
                    ))}{addedMovies.length === 0 ? <div className="font-bold text-left mb-4">No Items Added</div> : null}
                    {success ? <Collapse in={isSuccessOpen}><Alert className="mb-2" variant="filled" severity="success" action={<IconButton size="small" onClick={() => setIsSuccessOpen(false)}><CloseIcon fontSize="inherit"/></IconButton>}>{success.toString()}</Alert></Collapse> : null}
                    <input className="settings-btn button cursor-pointer" type="button" value={`${isNew ? "Create My List" : "Edit My List"}`} onClick={() => submit()}/>
                </form>
                    : <div>
                        {addedMovies.length !== 0 ? addedMovies.map((item, id) => (
                            getResultType(item, id)
                        )) : <div className="font-bold text-left mb-4">No Items Added</div>}
                    </div>}
            </div>
        </Layout>
    )
}