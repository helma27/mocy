import React, { useState } from "react";
import Input from "../components/Input";
import Picker from "../components/Picker";
import SearchItem from "../components/SearchItem";

function Search({ api }) {
  const [term, setTerm] = useState("");
  const [site, setSite] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState({});

  const search = async e => {
    if (e) e.preventDefault();
    setLoading(true);

    if (term !== "") {
      const res = await fetch(api + "api/v1/search/" + site + "?query=" + term);
      if (res.status !== 200) {
        setResponse({
          error: true,
          errorMessage: "Situsnya gak bisa dibuka mas :'("
        });
      } else {
        const response = await res.json();
        setResponse(response);
      }
    }

    setLoading(false);
  };

  return (
    <>
      <h1>Search</h1>
      <form onSubmit={search}>
        <Picker
          id="site"
          name="site"
          label="Pilih situsnya"
          value={site}
          onChange={setSite}
          options={[
            { name: "RARBG", value: "rarbg" },
            { name: "1337x", value: "1337x" },
            { name: "YTS", value: "yts" }
          ]}
          required
        />
        <Input
          id="term"
          name="term"
          label="Kata koentji"
          placeholder="Ariel dan luna maya 3gp..."
          value={term}
          onChange={setTerm}
          required
        />
        <button disabled={loading || !site} className={`btn primary${loading ? " loading" : ""}`} type="submit">
          Gas
        </button>
      </form>
      <div className="d-flex-column mv-1">
        {response.error && <div className="text-danger">{response.errorMessage}</div>}
        {response.results &&
          response.results.length > 0 &&
          response.results.map(result => <SearchItem api={api} site={site} result={result} key={result.link} />)}
      </div>
    </>
  );
}

Search.defaultProps = { api: "https://torrent-aio-bot.herokuapp.com/" };

export default Search;
