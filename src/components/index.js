import React, { useEffect, useMemo, useState } from "react";
import "./index.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import logo from "../images/col.png";

const CompaniesDirectory = () => {
  // data + loading/error
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // filters
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");

  // sorting
  const [sortBy, setSortBy] = useState("name-asc"); 

  // pagination
  const [pageSize, setPageSize] = useState(9);
  const [page, setPage] = useState(1);

  // fetch JSON from /public
  useEffect(() => {
    fetch("/companies.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load data");
        return res.json();
      })
      .then((data) => {
        setCompanies(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Error");
        setLoading(false);
      });
  }, []);

  // filter
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return companies.filter((c) => {
      const matchesName = c.name.toLowerCase().includes(s);
      const matchesLoc = !location || c.location === location;
      const matchesInd = !industry || c.industry === industry;
      return matchesName && matchesLoc && matchesInd;
    });
  }, [companies, search, location, industry]);

  // sort
  const filteredSorted = useMemo(() => {
    const data = [...filtered];
    if (sortBy === "name-asc") {
      data.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name-desc") {
      data.sort((a, b) => b.name.localeCompare(a.name));
    }
    return data;
  }, [filtered, sortBy]);

  const total = filteredSorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    setPage(1);
  }, [search, location, industry, sortBy, pageSize]);

  const startIndex = (page - 1) * pageSize;
  const currentPageItems = filteredSorted.slice(startIndex, startIndex + pageSize);

  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setIndustry("");
    setSortBy("name-asc");
    setPage(1);
  };

  return (
    <>
      <div className="header">
        <div className="logo">
          <img src={logo} alt="Logo" />
          <div className="title">
            <h1>FLM</h1>
            <p>Building Trust & Careers</p>
          </div>
        </div>
      </div>

      {/* FILTERS (unchanged layout) */}
      <div className="container" role="main">
        <h1>Companies Directory</h1>
        <div className="filter-card" aria-label="Filters">
          <div>
            <div className="lable">
              <label className="small" htmlFor="q">Search by name</label>
            </div>
            <input id="q" className="input" type="search" placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)}/>
          </div>
          <div>
            <label className="small" htmlFor="location">Location</label>
            <select id="location" className="input" value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="">All Locations</option>
              <option>New York</option>
              <option>London</option>
              <option>Berlin</option>
              <option>Paris</option>
              <option>Tokyo</option>
            </select>
          </div>

          <div>
            <label className="small" htmlFor="industry">Industry</label>
            <select id="industry" className="input" value={industry} onChange={(e) => setIndustry(e.target.value)}>
              <option value="">All Industries</option>
              <option>Technology</option>
              <option>Finance</option>
              <option>Healthcare</option>
              <option>Education</option>
              <option>Manufacturing</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", marginTop: 10,}}>
          <div style={{ fontSize: 14 }}>
            Showing <strong>{currentPageItems.length}</strong> of{" "}
            <strong>{total}</strong> results
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <label htmlFor="sort" style={{ fontSize: 14 }}>Sort</label>
              <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input" style={{ width: 180, padding: "8px 10px" }}>
                <option value="name-asc">Name (A–Z)</option>
                <option value="name-desc">Name (Z–A)</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <label htmlFor="pagesize" style={{ fontSize: 14 }}>Per page</label>
              <select id="pagesize" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="input" style={{ width: 100, padding: "8px 10px" }}>
                <option value={6}>6</option>
                <option value={9}>9</option>
                <option value={12}>12</option>
              </select>
            </div>

            <button onClick={clearFilters} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #d0d5dd", background: "#fff", cursor: "pointer",}}>
              Clear filters
            </button>
          </div>
        </div>
      </div>
      {!loading && !error && (
        <>
          <div className="company-grid">
            {currentPageItems.length > 0 ? (
              currentPageItems.map((c, idx) => (
                <div className="company-card" key={`${c.name}-${idx}`}>
                  <div className="company-name">{c.name}</div>
                  <div className="company-details">
                    <p>
                      <i className="bi bi-geo-alt-fill"></i>
                      <strong>Location:</strong> {c.location}
                    </p>
                    <p>
                      <i className="bi bi-building"></i>
                      <strong>Industry:</strong> {c.industry}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ padding: 20 }}>No companies found.</p>
            )}
          </div>

          {/* PAGINATION CONTROLS */}
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              justifyContent: "center",
              margin: "10px 0 20px",
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #d0d5dd",
                background: page === 1 ? "#f2f4f7" : "#fff",
                cursor: page === 1 ? "not-allowed" : "pointer",
              }}
            >
              Prev
            </button>

            <span style={{ fontSize: 14 }}>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #d0d5dd",
                background: page === totalPages ? "#f2f4f7" : "#fff",
                cursor: page === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* FOOTER (unchanged) */}
      <div className="footer">
        <div className="footer-text">
          <p>Built with plain HTML, CSS, Reactjs. All Rights Reserved by FLM</p>
        </div>
      </div>
    </>
  );
};

export default CompaniesDirectory;
