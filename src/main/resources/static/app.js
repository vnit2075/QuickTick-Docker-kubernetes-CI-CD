/* =============================================
   QuickTick Application JavaScript - SPA Logic
   ============================================= */

// Global Application State
const state = {
    currentUser: null,
    movies: [],
    filteredMovies: [],
    theaters: [],
    currentCity: 'Bangalore',
    activeMovieStatus: 'NOW_SHOWING',
    selectedMovie: null,
    selectedDate: null,
    selectedShow: null,
    selectedSeats: [] // contains seat objects: {id, seatNumber, rowLabel, type, price}
};

// DOM Elements cache
const el = {
    signInBtn: document.getElementById('signInBtn'),
    userProfile: document.getElementById('userProfile'),
    userNameLabel: document.getElementById('userNameLabel'),
    profileDropdownTrigger: document.getElementById('profileDropdownTrigger'),
    profileDropdown: document.getElementById('profileDropdown'),
    adminDashboardLink: document.getElementById('adminDashboardLink'),
    signOutBtn: document.getElementById('signOutBtn'),
    viewBookingsBtn: document.getElementById('viewBookingsBtn'),
    citySelect: document.getElementById('citySelect'),
    movieSearchInput: document.getElementById('movieSearchInput'),
    
    // Featured Hero Banner
    heroBanner: document.getElementById('heroBanner'),
    heroTitle: document.getElementById('heroTitle'),
    heroGenre: document.getElementById('heroGenre'),
    heroDuration: document.getElementById('heroDuration'),
    heroLang: document.getElementById('heroLang'),
    heroDesc: document.getElementById('heroDesc'),
    heroBookBtn: document.getElementById('heroBookBtn'),
    heroBackdrop: document.getElementById('heroBackdrop'),
    
    // Tabs & Grid
    tabNowShowing: document.getElementById('tabNowShowing'),
    tabUpcoming: document.getElementById('tabUpcoming'),
    moviesGrid: document.getElementById('moviesGrid'),
    
    // Modals
    authModal: document.getElementById('authModal'),
    movieDetailsModal: document.getElementById('movieDetailsModal'),
    showtimeModal: document.getElementById('showtimeModal'),
    seatModal: document.getElementById('seatModal'),
    checkoutModal: document.getElementById('checkoutModal'),
    ticketModal: document.getElementById('ticketModal'),
    bookingsListModal: document.getElementById('bookingsListModal'),
    adminModal: document.getElementById('adminModal'),
    
    // Auth Forms
    loginTabBtn: document.getElementById('loginTabBtn'),
    registerTabBtn: document.getElementById('registerTabBtn'),
    loginFormContainer: document.getElementById('loginFormContainer'),
    registerFormContainer: document.getElementById('registerFormContainer'),
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    loginError: document.getElementById('loginError'),
    registerError: document.getElementById('registerError'),
    registerSuccess: document.getElementById('registerSuccess'),
    
    // Detail Modal elements
    detailPoster: document.getElementById('detailPoster'),
    detailTitle: document.getElementById('detailTitle'),
    detailGenre: document.getElementById('detailGenre'),
    detailDuration: document.getElementById('detailDuration'),
    detailLang: document.getElementById('detailLang'),
    detailRelease: document.getElementById('detailRelease'),
    detailDesc: document.getElementById('detailDesc'),
    detailTrailerFrame: document.getElementById('detailTrailerFrame'),
    detailBookBtn: document.getElementById('detailBookBtn'),
    
    // Showtime selection elements
    showtimeMovieTitle: document.getElementById('showtimeMovieTitle'),
    dateStrip: document.getElementById('dateStrip'),
    showtimeTheatersList: document.getElementById('showtimeTheatersList'),
    
    // Seat selection elements
    seatMovieTitle: document.getElementById('seatMovieTitle'),
    seatShowDetails: document.getElementById('seatShowDetails'),
    seatGridContainer: document.getElementById('seatGridContainer'),
    selectedSeatsLabel: document.getElementById('selectedSeatsLabel'),
    totalPriceLabel: document.getElementById('totalPriceLabel'),
    proceedToPayBtn: document.getElementById('proceedToPayBtn'),
    
    // Checkout elements
    chkMovieTitle: document.getElementById('chkMovieTitle'),
    chkTheater: document.getElementById('chkTheater'),
    chkShowtime: document.getElementById('chkShowtime'),
    chkSeats: document.getElementById('chkSeats'),
    chkTotal: document.getElementById('chkTotal'),
    paymentForm: document.getElementById('paymentForm'),
    paymentLoading: document.getElementById('paymentLoading'),
    paymentError: document.getElementById('paymentError'),
    
    // Ticket elements
    tktMovieTitle: document.getElementById('tktMovieTitle'),
    tktTheater: document.getElementById('tktTheater'),
    tktScreen: document.getElementById('tktScreen'),
    tktDate: document.getElementById('tktDate'),
    tktTime: document.getElementById('tktTime'),
    tktSeats: document.getElementById('tktSeats'),
    tktId: document.getElementById('tktId'),
    barcodeValue: document.getElementById('barcodeValue'),
    ticketCloseBtn: document.getElementById('ticketCloseBtn'),
    
    // Bookings list element
    bookingsHistoryList: document.getElementById('bookingsHistoryList'),
    
    // Admin Modal Elements
    adminAddMovieBtn: document.getElementById('adminAddMovieBtn'),
    addMovieFormBlock: document.getElementById('addMovieFormBlock'),
    addMovieForm: document.getElementById('addMovieForm'),
    cancelMovieBtn: document.getElementById('cancelMovieBtn'),
    adminAddShowBtn: document.getElementById('adminAddShowBtn'),
    addShowFormBlock: document.getElementById('addShowFormBlock'),
    addShowForm: document.getElementById('addShowForm'),
    cancelShowBtn: document.getElementById('cancelShowBtn'),
    adminMoviesTableBody: document.getElementById('adminMoviesTableBody'),
    adminShowsTableBody: document.getElementById('adminShowsTableBody'),
    adminBookingsTableBody: document.getElementById('adminBookingsTableBody'),
    adminUsersTableBody: document.getElementById('adminUsersTableBody'),
    
    // Admin Dashboard Stats
    statRevenue: document.getElementById('statRevenue'),
    statBookings: document.getElementById('statBookings'),
    statMovies: document.getElementById('statMovies'),
    statUsers: document.getElementById('statUsers')
};

// Initial setup
window.addEventListener('DOMContentLoaded', () => {
    checkUserSession();
    fetchMovies();
    fetchTheaters();
    setupEventListeners();
});

// 1. Session & Auth Functions
async function checkUserSession() {
    try {
        const res = await fetch('/api/auth/me');
        if (res.status === 200) {
            const user = await res.json();
            loginUserSuccess(user);
        } else {
            logoutUserSuccess();
        }
    } catch (e) {
        logoutUserSuccess();
    }
}

function loginUserSuccess(user) {
    state.currentUser = user;
    el.signInBtn.classList.add('hidden');
    el.userProfile.classList.remove('hidden');
    el.userNameLabel.textContent = user.name;
    
    if (user.role === 'ADMIN') {
        el.adminDashboardLink.classList.remove('hidden');
    } else {
        el.adminDashboardLink.classList.add('hidden');
    }
}

function logoutUserSuccess() {
    state.currentUser = null;
    el.signInBtn.classList.remove('hidden');
    el.userProfile.classList.add('hidden');
    el.adminDashboardLink.classList.add('hidden');
}

// 2. Fetch Data
async function fetchMovies() {
    try {
        const res = await fetch('/api/movies');
        state.movies = await res.json();
        state.filteredMovies = [...state.movies];
        renderMoviesGrid();
        renderHeroBanner();
    } catch (e) {
        el.moviesGrid.innerHTML = `<p class="error-msg">Failed to load movies. Please check database connection.</p>`;
    }
}

async function fetchTheaters() {
    try {
        const res = await fetch('/api/theaters');
        state.theaters = await res.json();
    } catch (e) {
        console.error("Error fetching theaters", e);
    }
}

// 3. Render Functions
function renderHeroBanner() {
    const showingMovies = state.movies.filter(m => m.status === 'NOW_SHOWING');
    if (showingMovies.length === 0) return;
    
    // Use the first movie as featured banner
    const movie = showingMovies[0];
    state.selectedMovie = movie;
    
    el.heroTitle.textContent = movie.title;
    el.heroGenre.innerHTML = `<i class="fa-solid fa-clapperboard"></i> ${movie.genre}`;
    el.heroDuration.innerHTML = `<i class="fa-regular fa-clock"></i> ${movie.durationMinutes} mins`;
    el.heroLang.innerHTML = `<i class="fa-solid fa-language"></i> ${movie.language}`;
    el.heroDesc.textContent = movie.description;
    
    if (movie.posterUrl) {
        el.heroBackdrop.style.backgroundImage = `url('${movie.posterUrl}')`;
    }
}

function renderMoviesGrid() {
    const grid = el.moviesGrid;
    grid.innerHTML = '';
    
    const displayList = state.filteredMovies.filter(m => m.status === state.activeMovieStatus);
    
    if (displayList.length === 0) {
        grid.innerHTML = `<p class="no-movies-msg">No movies found matching status or search term.</p>`;
        return;
    }
    
    displayList.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `
            <img class="movie-poster" src="${movie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60'}" alt="${movie.title}">
            <div class="movie-details">
                <h4 class="movie-card-title">${movie.title}</h4>
                <p class="movie-card-genre">${movie.genre}</p>
                <div class="movie-card-footer">
                    <span class="movie-tag-lang">${movie.language}</span>
                    <button class="btn btn-primary btn-sm card-book-btn">Book</button>
                </div>
            </div>
        `;
        
        card.querySelector('.card-book-btn').addEventListener('click', (e) => {
            e.stopPropagation(); // prevent modal opening trigger
            openShowtimeSelector(movie);
        });
        
        card.addEventListener('click', () => {
            openMovieDetails(movie);
        });
        
        grid.appendChild(card);
    });
}

// 4. Modals Actions
function openModal(modal) {
    modal.classList.remove('hidden');
}

function closeModal(modal) {
    modal.classList.add('hidden');
}

function closeAllModals() {
    const overlays = document.querySelectorAll('.modal-overlay');
    overlays.forEach(o => o.classList.add('hidden'));
    
    // Stop trailer iframe playing in background
    el.detailTrailerFrame.src = "";
}

// 5. Open Modal Specific Operations
function openMovieDetails(movie) {
    state.selectedMovie = movie;
    el.detailTitle.textContent = movie.title;
    el.detailGenre.textContent = movie.genre;
    el.detailDuration.textContent = `${movie.durationMinutes} mins`;
    el.detailLang.textContent = movie.language;
    el.detailRelease.textContent = `Released: ${movie.releaseDate}`;
    el.detailDesc.textContent = movie.description;
    el.detailPoster.src = movie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60';
    
    if (movie.trailerUrl && movie.trailerUrl.startsWith('http')) {
        el.detailTrailerFrame.src = movie.trailerUrl;
        el.detailTrailerFrame.parentElement.parentElement.classList.remove('hidden');
    } else {
        el.detailTrailerFrame.src = "";
        el.detailTrailerFrame.parentElement.parentElement.classList.add('hidden');
    }

    if (movie.status === 'UPCOMING') {
        el.detailBookBtn.disabled = true;
        el.detailBookBtn.textContent = "Coming Soon";
    } else {
        el.detailBookBtn.disabled = false;
        el.detailBookBtn.textContent = "Book Tickets Now";
    }
    
    openModal(el.movieDetailsModal);
}

function openShowtimeSelector(movie) {
    closeAllModals();
    state.selectedMovie = movie;
    el.showtimeMovieTitle.textContent = `Book Tickets for: ${movie.title}`;
    
    // Generate dates (Today, Tomorrow, Day after)
    generateDateStrip();
    openModal(el.showtimeModal);
}

function generateDateStrip() {
    el.dateStrip.innerHTML = '';
    const today = new Date();
    
    for (let i = 0; i < 3; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        
        const dateStr = d.toISOString().split('T')[0];
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNum = d.getDate();
        
        const btn = document.createElement('button');
        btn.className = `date-btn ${i === 0 ? 'active' : ''}`;
        btn.dataset.date = dateStr;
        btn.innerHTML = `
            <span class="date-btn-day">${dayName}</span>
            <span class="date-btn-num">${dayNum}</span>
        `;
        
        btn.addEventListener('click', () => {
            document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.selectedDate = dateStr;
            fetchShowsForMovie(state.selectedMovie.id, dateStr);
        });
        
        el.dateStrip.appendChild(btn);
        
        if (i === 0) {
            state.selectedDate = dateStr;
            fetchShowsForMovie(movie.id, dateStr); // initial trigger
        }
    }
}

async function fetchShowsForMovie(movieId, dateStr) {
    el.showtimeTheatersList.innerHTML = `<div class="spinner"></div>`;
    try {
        const res = await fetch(`/api/shows?movieId=${movieId}&date=${dateStr}`);
        const shows = await res.json();
        renderShowtimes(shows);
    } catch (e) {
        el.showtimeTheatersList.innerHTML = `<p class="error-msg">Error loading showtimes.</p>`;
    }
}

function renderShowtimes(shows) {
    const container = el.showtimeTheatersList;
    container.innerHTML = '';
    
    // Filter shows based on selected city (by checking screen.theater.city)
    const cityShows = shows.filter(show => show.screen.theater.city === state.currentCity);
    
    if (cityShows.length === 0) {
        container.innerHTML = `<p class="no-movies-msg">No shows available in ${state.currentCity} on this date.</p>`;
        return;
    }
    
    // Group shows by theater ID
    const theaterGroups = {};
    cityShows.forEach(show => {
        const theater = show.screen.theater;
        if (!theaterGroups[theater.id]) {
            theaterGroups[theater.id] = {
                theater: theater,
                screens: {}
            };
        }
        
        const screen = show.screen;
        if (!theaterGroups[theater.id].screens[screen.id]) {
            theaterGroups[theater.id].screens[screen.id] = {
                screen: screen,
                shows: []
            };
        }
        
        theaterGroups[theater.id].screens[screen.id].shows.push(show);
    });
    
    // Draw grouped lists
    for (const key in theaterGroups) {
        const group = theaterGroups[key];
        const row = document.createElement('div');
        row.className = 'theater-row';
        
        let screenHtml = '';
        for (const sKey in group.screens) {
            const sGroup = group.screens[sKey];
            let timeHtml = '';
            
            // Sort shows by start time
            sGroup.shows.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
            
            sGroup.shows.forEach(show => {
                const startTime = new Date(show.startTime);
                const timeStr = startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                timeHtml += `<button class="showtime-btn" data-show-id="${show.id}">${timeStr}</button>`;
            });
            
            screenHtml += `
                <div class="screen-group">
                    <div class="screen-title">${sGroup.screen.name}</div>
                    <div class="showtimes-grid">
                        ${timeHtml}
                    </div>
                </div>
            `;
        }
        
        row.innerHTML = `
            <div class="theater-name"><i class="fa-solid fa-building-columns"></i> ${group.theater.name}</div>
            <div class="theater-address">${group.theater.address}</div>
            ${screenHtml}
        `;
        
        row.querySelectorAll('.showtime-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const showId = btn.dataset.showId;
                openSeatSelector(showId);
            });
        });
        
        container.appendChild(row);
    }
}

// 6. Seat Selection System
async function openSeatSelector(showId) {
    closeAllModals();
    state.selectedSeats = [];
    updateSeatSummary();
    
    el.seatGridContainer.innerHTML = `<div class="spinner"></div>`;
    openModal(el.seatModal);
    
    try {
        const res = await fetch(`/api/shows/${showId}`);
        if (!res.ok) throw new Error();
        
        const details = await res.json();
        state.selectedShow = details.show;
        
        el.seatMovieTitle.textContent = state.selectedShow.movie.title;
        const sTime = new Date(state.selectedShow.startTime);
        const dateStr = sTime.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' });
        const timeStr = sTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        el.seatShowDetails.textContent = `${state.selectedShow.screen.theater.name}: ${state.selectedShow.screen.name} | ${dateStr} | ${timeStr}`;
        
        renderSeatsGrid(details.seats);
    } catch (e) {
        el.seatGridContainer.innerHTML = `<p class="error-msg">Error loading seat layout.</p>`;
    }
}

function renderSeatsGrid(showSeats) {
    const grid = el.seatGridContainer;
    grid.innerHTML = '';
    
    // Group seats by row label (e.g. A, B, C, D, E)
    const rows = {};
    showSeats.forEach(ss => {
        const row = ss.seat.rowLabel;
        if (!rows[row]) rows[row] = [];
        rows[row].push(ss);
    });
    
    // Sort rows and seats
    const sortedKeys = Object.keys(rows).sort();
    sortedKeys.forEach(rowKey => {
        const rowSeats = rows[rowKey];
        rowSeats.sort((a,b) => a.seat.seatNumber.localeCompare(b.seat.seatNumber, undefined, {numeric: true}));
        
        const rowDiv = document.createElement('div');
        rowDiv.className = 'seat-row';
        rowDiv.innerHTML = `<span class="row-name-label">${rowKey}</span>`;
        
        const seatsContainer = document.createElement('div');
        seatsContainer.className = 'seats-row-container';
        
        rowSeats.forEach(ss => {
            const seatBox = document.createElement('div');
            // Class name according to status and category
            let classType = ss.seat.seatType.toLowerCase();
            let status = ss.status.toLowerCase();
            
            seatBox.className = `seat-box ${classType} ${status}`;
            seatBox.dataset.showSeatId = ss.id;
            seatBox.dataset.seatId = ss.seat.id;
            seatBox.dataset.seatNo = ss.seat.seatNumber;
            seatBox.dataset.type = ss.seat.seatType;
            
            // Set dynamic price attribute based on seat type
            let price = state.selectedShow.priceRegular;
            if (ss.seat.seatType === 'PREMIUM') price = state.selectedShow.pricePremium;
            if (ss.seat.seatType === 'RECLINER') price = state.selectedShow.priceRecliner;
            seatBox.dataset.price = price;
            
            seatBox.textContent = ss.seat.seatNumber.replace(/[A-E]/g, ''); // just show numbers inside boxes
            
            if (ss.status === 'AVAILABLE') {
                seatBox.addEventListener('click', () => {
                    toggleSeatSelection(seatBox);
                });
            }
            
            seatsContainer.appendChild(seatBox);
        });
        
        rowDiv.appendChild(seatsContainer);
        grid.appendChild(rowDiv);
    });
}

function toggleSeatSelection(seatBox) {
    const seatId = parseInt(seatBox.dataset.seatId);
    const seatNo = seatBox.dataset.seatNo;
    const type = seatBox.dataset.type;
    const price = parseFloat(seatBox.dataset.price);
    
    const index = state.selectedSeats.findIndex(s => s.id === seatId);
    
    if (index > -1) {
        state.selectedSeats.splice(index, 1);
        seatBox.classList.remove('selected');
    } else {
        // Limit to max 10 tickets
        if (state.selectedSeats.length >= 10) {
            alert("You can select up to 10 seats per booking.");
            return;
        }
        state.selectedSeats.push({ id: seatId, seatNo, type, price });
        seatBox.classList.add('selected');
    }
    
    updateSeatSummary();
}

function updateSeatSummary() {
    if (state.selectedSeats.length === 0) {
        el.selectedSeatsLabel.textContent = "None";
        el.totalPriceLabel.textContent = "₹0.00";
        el.proceedToPayBtn.disabled = true;
    } else {
        const names = state.selectedSeats.map(s => s.seatNo).join(', ');
        el.selectedSeatsLabel.textContent = names;
        
        const subtotal = state.selectedSeats.reduce((sum, s) => sum + s.price, 0);
        const fees = 30 * state.selectedSeats.length; // 30 rs ticket fee
        const total = subtotal + fees;
        
        el.totalPriceLabel.textContent = `₹${total.toFixed(2)}`;
        el.proceedToPayBtn.disabled = false;
    }
}

// 7. Checkout Process
function startCheckout() {
    if (!state.currentUser) {
        // user not logged in, prompt sign in first
        closeAllModals();
        openModal(el.authModal);
        // Alert the user they need to log in
        el.loginError.textContent = "Please sign in to proceed with booking your tickets.";
        el.loginError.classList.remove('hidden');
        return;
    }
    
    closeAllModals();
    
    // Populate checkout
    el.chkMovieTitle.textContent = state.selectedShow.movie.title;
    el.chkTheater.textContent = `${state.selectedShow.screen.theater.name} (${state.selectedShow.screen.theater.city})`;
    
    const sTime = new Date(state.selectedShow.startTime);
    const dateStr = sTime.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = sTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    el.chkShowtime.textContent = `${dateStr} @ ${timeStr} (${state.selectedShow.screen.name})`;
    
    const seatNames = state.selectedSeats.map(s => s.seatNo).join(', ');
    el.chkSeats.textContent = seatNames;
    
    const subtotal = state.selectedSeats.reduce((sum, s) => sum + s.price, 0);
    const fees = 30 * state.selectedSeats.length;
    const total = subtotal + fees;
    el.chkTotal.textContent = `₹${total.toFixed(2)}`;
    
    // Hide spinner
    el.paymentLoading.classList.add('hidden');
    el.paymentError.classList.add('hidden');
    el.paymentForm.classList.remove('hidden');
    
    openModal(el.checkoutModal);
}

async function processPayment(e) {
    e.preventDefault();
    el.paymentForm.classList.add('hidden');
    el.paymentLoading.classList.remove('hidden');
    el.paymentError.classList.add('hidden');
    
    const seatIds = state.selectedSeats.map(s => s.id);
    const bookingRequest = {
        showId: state.selectedShow.id,
        seatIds: seatIds
    };
    
    // Simulate 2 seconds network delay for premium feel
    setTimeout(async () => {
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingRequest)
            });
            
            if (res.ok) {
                const booking = await res.json();
                closeAllModals();
                showConfirmedTicket(booking);
            } else {
                const errMsg = await res.text();
                showPaymentError(errMsg || "Transaction failed. Please try again.");
            }
        } catch (e) {
            showPaymentError("Network error. Please try again.");
        }
    }, 2000);
}

function showPaymentError(msg) {
    el.paymentLoading.classList.add('hidden');
    el.paymentForm.classList.remove('hidden');
    el.paymentError.textContent = msg;
    el.paymentError.classList.remove('hidden');
}

function showConfirmedTicket(booking) {
    el.tktMovieTitle.textContent = booking.show.movie.title;
    el.tktTheater.textContent = booking.show.screen.theater.name;
    el.tktScreen.textContent = booking.show.screen.name;
    
    const sTime = new Date(booking.show.startTime);
    el.tktDate.textContent = sTime.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    el.tktTime.textContent = sTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    const seats = booking.bookedSeats.map(bs => bs.seat.seatNumber).join(', ');
    el.tktSeats.textContent = seats;
    
    el.tktId.textContent = `#QCK${booking.id}`;
    el.barcodeValue.textContent = `QCK-SHOW-${booking.show.id}-TKT-${booking.id}`;
    
    openModal(el.ticketModal);
}

// 8. Bookings History
async function openBookingsHistory() {
    closeAllModals();
    el.bookingsHistoryList.innerHTML = `<div class="spinner"></div>`;
    openModal(el.bookingsListModal);
    
    try {
        const res = await fetch('/api/bookings');
        if (!res.ok) throw new Error();
        
        const bookings = await res.json();
        renderBookingsHistory(bookings);
    } catch (e) {
        el.bookingsHistoryList.innerHTML = `<p class="error-msg">Failed to load booking history.</p>`;
    }
}

function renderBookingsHistory(bookings) {
    const container = el.bookingsHistoryList;
    container.innerHTML = '';
    
    if (bookings.length === 0) {
        container.innerHTML = `<p class="no-movies-msg">You haven't booked any tickets yet.</p>`;
        return;
    }
    
    bookings.forEach(booking => {
        const card = document.createElement('div');
        card.className = 'history-booking-card';
        
        const sTime = new Date(booking.show.startTime);
        const dateStr = sTime.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
        const timeStr = sTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const seats = booking.bookedSeats.map(bs => bs.seat.seatNumber).join(', ');
        
        card.innerHTML = `
            <div>
                <h4 class="history-title">${booking.show.movie.title}</h4>
                <p class="history-meta"><i class="fa-solid fa-building-columns"></i> ${booking.show.screen.theater.name} | ${booking.show.screen.name}</p>
                <p class="history-meta"><i class="fa-regular fa-calendar"></i> ${dateStr} at ${timeStr}</p>
                <p class="history-meta"><i class="fa-solid fa-chair"></i> Seats: <strong>${seats}</strong></p>
            </div>
            <div style="text-align: right;">
                <span class="tag" style="background: rgba(16,185,129,0.1); color: var(--color-success); border-color: rgba(16,185,129,0.2)">${booking.status}</span>
                <p style="margin-top: 8px; font-weight: 700;">₹${booking.totalAmount.toFixed(2)}</p>
            </div>
        `;
        
        card.addEventListener('click', () => {
            closeAllModals();
            showConfirmedTicket(booking);
        });
        
        container.appendChild(card);
    });
}

// 9. Admin Operations
async function openAdminDashboard() {
    closeAllModals();
    openModal(el.adminModal);
    switchAdminTab('adminTabDashboard');
    
    try {
        loadAdminStats();
    } catch (e) {
        console.error("Error loading dashboard", e);
    }
}

async function loadAdminStats() {
    try {
        const res = await fetch('/api/admin/stats');
        const stats = await res.json();
        el.statRevenue.textContent = `₹${stats.totalRevenue.toFixed(2)}`;
        el.statBookings.textContent = stats.totalBookings;
        el.statMovies.textContent = stats.totalMovies;
        el.statUsers.textContent = stats.totalUsers;
    } catch (e) {
        console.error("Error fetching stats", e);
    }
}

async function loadAdminMovies() {
    el.adminMoviesTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;"><div class="spinner"></div></td></tr>`;
    try {
        const res = await fetch('/api/movies');
        const movies = await res.json();
        
        let html = '';
        movies.forEach(m => {
            const badgeClass = m.status === 'NOW_SHOWING' ? 'badge-nowshowing' : 'badge-upcoming';
            html += `
                <tr>
                    <td>${m.id}</td>
                    <td><img src="${m.posterUrl}" width="40" height="50" style="border-radius:4px;"></td>
                    <td><strong>${m.title}</strong></td>
                    <td>${m.genre}</td>
                    <td>${m.durationMinutes} mins</td>
                    <td><span class="${badgeClass}">${m.status}</span></td>
                    <td>
                        <button class="btn btn-danger btn-sm delete-movie-btn" data-id="${m.id}"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        });
        el.adminMoviesTableBody.innerHTML = html || '<tr><td colspan="7">No movies in catalog.</td></tr>';
        
        // Bind deletes
        el.adminMoviesTableBody.querySelectorAll('.delete-movie-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                deleteMovie(id);
            });
        });
    } catch (e) {
        el.adminMoviesTableBody.innerHTML = `<tr><td colspan="7" class="error-msg">Error loading movies.</td></tr>`;
    }
}

async function deleteMovie(id) {
    if (!confirm("Are you sure you want to delete this movie? All associated shows will also be deleted.")) return;
    try {
        const res = await fetch(`/api/admin/movies/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadAdminMovies();
            fetchMovies(); // reload main catalog
        } else {
            alert("Delete failed.");
        }
    } catch (e) {
        alert("Network error.");
    }
}

async function loadAdminShows() {
    el.adminShowsTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center;"><div class="spinner"></div></td></tr>`;
    try {
        const res = await fetch('/api/movies');
        const movies = await res.json();
        
        // Load movies into selection form
        let selectMovieHtml = '<option value="">-- Choose Movie --</option>';
        movies.forEach(m => {
            selectMovieHtml += `<option value="${m.id}">${m.title} (${m.language})</option>`;
        });
        el.sFormMovie.innerHTML = selectMovieHtml;

        // Load screens into selection form
        const resScreens = await fetch('/api/theaters');
        const theaters = await resScreens.json();
        let selectScreenHtml = '<option value="">-- Choose Screen --</option>';
        theaters.forEach(t => {
            // Usually we query screens from backend, but since screens are seeded, we'll fetch them.
            // Let's hardcode screen selections based on seeded screens or load them.
            // We can fetch theaters, but wait, do we have an API for screens?
            // In ScreenRepository we have findByTheaterId. Or we can just populate screens.
            // To make it simple, seeded screens are IDs 1, 2, 3, 4. Let's hardcode the screens in selection.
        });
        // Seeded screens: screen1=PVR Audi 1, screen2=PVR Audi 2, screen3=Inox Screen 1, screen4=IMAX Screen
        selectScreenHtml += `
            <option value="1">PVR Forum Mall - Audi 1</option>
            <option value="2">PVR Forum Mall - Audi 2</option>
            <option value="3">Inox Lido Mall - Screen 1</option>
            <option value="4">IMAX Nexus Mall - IMAX screen</option>
        `;
        el.sFormScreen.innerHTML = selectScreenHtml;

        // Fetch shows. Since there is no admin shows endpoint, we can fetch all shows or loop.
        // Wait, shows are generated. Can we fetch shows? Let's implement getting shows.
        // Actually, we can fetch all bookings, but how about shows? We can query shows from database.
        // Since we don't have a direct "getAllShows" API in PublicController, wait!
        // We can create one or we can query bookings. 
        // Let's write a quick endpoint if needed, or query them. Wait, did we provide a GET `/api/admin/shows`?
        // Ah, in AdminController, we didn't add a GET `/api/admin/shows`, but we have a POST and DELETE.
        // We can fetch shows of a movie. Let's just list the shows by querying theaters, or we can add a GET `/api/shows` catalog?
        // Wait, let's see. In PublicController, we have GET `/api/shows?movieId={id}&date={date}`.
        // To show scheduled shows, we can fetch movies and show their listings, or fetch them.
        // Let's verify what we can do. Can we add a GET `/api/admin/shows` in `AdminController`?
        // Yes, we can edit `AdminController.java` to add a GET `/api/admin/shows` endpoint!
        // Wait, is that necessary? Yes, it makes managing shows very easy.
        // Let's first look at what we have in `AdminController.java`. We have:
        // `@PostMapping("/shows")`
        // `@DeleteMapping("/shows/{id}")`
        // We can add `@GetMapping("/shows")` which returns `showRepository.findAll()`.
        // Let's do that! It will make the shows list fully functional in the admin panel!
        // That is a simple file replacement. Let's write `app.js` first, then add the endpoint.
        
        // Wait, for now let's query the shows. We can add a fetch to `/api/admin/shows` in the code.
        const resShows = await fetch('/api/admin/shows');
        const shows = await resShows.json();
        
        let html = '';
        shows.sort((a,b) => new Date(a.startTime) - new Date(b.startTime));
        
        shows.forEach(s => {
            const timeStr = new Date(s.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            html += `
                <tr>
                    <td>${s.id}</td>
                    <td><strong>${s.movie.title}</strong></td>
                    <td>${s.screen.theater.name}</td>
                    <td>${s.screen.name}</td>
                    <td>${s.showDate}</td>
                    <td>${timeStr}</td>
                    <td>₹${s.priceRegular}/₹${s.pricePremium}/₹${s.priceRecliner}</td>
                    <td>
                        <button class="btn btn-danger btn-sm delete-show-btn" data-id="${s.id}"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        });
        el.adminShowsTableBody.innerHTML = html || '<tr><td colspan="8">No shows scheduled.</td></tr>';

        el.adminShowsTableBody.querySelectorAll('.delete-show-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                deleteShow(id);
            });
        });
    } catch (e) {
        el.adminShowsTableBody.innerHTML = `<tr><td colspan="8" class="error-msg">Error loading shows. Ensure /api/admin/shows endpoint is available.</td></tr>`;
    }
}

async function deleteShow(id) {
    if (!confirm("Are you sure you want to delete this show?")) return;
    try {
        const res = await fetch(`/api/admin/shows/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadAdminShows();
        } else {
            alert("Delete failed.");
        }
    } catch (e) {
        alert("Network error.");
    }
}

async function loadAdminBookings() {
    el.adminBookingsTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;"><div class="spinner"></div></td></tr>`;
    try {
        const res = await fetch('/api/admin/bookings');
        const bookings = await res.json();
        
        let html = '';
        bookings.forEach(b => {
            const sTime = new Date(b.show.startTime);
            const dateStr = sTime.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
            const timeStr = sTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const seats = b.bookedSeats.map(bs => bs.seat.seatNumber).join(', ');
            
            html += `
                <tr>
                    <td>#QCK${b.id}</td>
                    <td>${b.user.name}<br><small>${b.user.email}</small></td>
                    <td><strong>${b.show.movie.title}</strong></td>
                    <td>${b.show.screen.theater.name}<br>${dateStr} at ${timeStr}</td>
                    <td><strong>₹${b.totalAmount.toFixed(2)}</strong><br><small>${seats}</small></td>
                    <td>${new Date(b.bookingTime).toLocaleString()}</td>
                    <td><span class="tag" style="background: rgba(16,185,129,0.1); color: var(--color-success); font-size:11px;">${b.status}</span></td>
                </tr>
            `;
        });
        el.adminBookingsTableBody.innerHTML = html || '<tr><td colspan="7">No bookings in the system.</td></tr>';
    } catch (e) {
        el.adminBookingsTableBody.innerHTML = `<tr><td colspan="7" class="error-msg">Error loading bookings logs.</td></tr>`;
    }
}

async function loadAdminUsers() {
    el.adminUsersTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;"><div class="spinner"></div></td></tr>`;
    try {
        const res = await fetch('/api/admin/users');
        const users = await res.json();
        
        let html = '';
        users.forEach(u => {
            html += `
                <tr>
                    <td>${u.id}</td>
                    <td><strong>${u.name}</strong></td>
                    <td>${u.email}</td>
                    <td>${u.phone || 'N/A'}</td>
                    <td><span class="tag">${u.role}</span></td>
                </tr>
            `;
        });
        el.adminUsersTableBody.innerHTML = html || '<tr><td colspan="5">No users registered.</td></tr>';
    } catch (e) {
        el.adminUsersTableBody.innerHTML = `<tr><td colspan="5" class="error-msg">Error loading users directory.</td></tr>`;
    }
}

function switchAdminTab(panelId) {
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(panelId).classList.remove('hidden');
    document.querySelector(`[data-tab="${panelId}"]`).classList.add('active');
    
    // Hide form folders
    el.addMovieFormBlock.classList.add('hidden');
    el.addShowFormBlock.classList.add('hidden');
    
    // Load relevant data
    if (panelId === 'adminTabDashboard') loadAdminStats();
    if (panelId === 'adminTabMovies') loadAdminMovies();
    if (panelId === 'adminTabShows') loadAdminShows();
    if (panelId === 'adminTabBookings') loadAdminBookings();
    if (panelId === 'adminTabUsers') loadAdminUsers();
}

// 10. Event Listeners Setup
function setupEventListeners() {
    // Logo returns home
    document.getElementById('logoBtn').addEventListener('click', () => {
        closeAllModals();
        fetchMovies();
    });
    
    // Auth Modal tab switching
    el.loginTabBtn.addEventListener('click', () => {
        el.loginTabBtn.classList.add('active');
        el.registerTabBtn.classList.remove('active');
        el.loginFormContainer.classList.remove('hidden');
        el.registerFormContainer.classList.add('hidden');
    });
    
    el.registerTabBtn.addEventListener('click', () => {
        el.registerTabBtn.classList.add('active');
        el.loginTabBtn.classList.remove('active');
        el.registerFormContainer.classList.remove('hidden');
        el.loginFormContainer.classList.add('hidden');
    });

    // Sign in trigger
    el.signInBtn.addEventListener('click', () => {
        el.loginError.classList.add('hidden');
        el.registerError.classList.add('hidden');
        el.registerSuccess.classList.add('hidden');
        openModal(el.authModal);
    });

    // Dropdown profile hover/click toggle
    el.profileDropdownTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        el.profileDropdown.classList.toggle('show');
    });
    document.addEventListener('click', () => {
        el.profileDropdown.classList.remove('show');
    });

    // Sign out button
    el.signOutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            logoutUserSuccess();
            closeAllModals();
            window.location.reload();
        } catch (e) {
            console.error("Logout failed", e);
        }
    });

    // City Selector
    el.citySelect.addEventListener('change', (e) => {
        state.currentCity = e.target.value;
        if (state.selectedMovie) {
            // refresh showtime selector if open
            if (!el.showtimeModal.classList.contains('hidden')) {
                fetchShowsForMovie(state.selectedMovie.id, state.selectedDate);
            }
        }
    });

    // Movie Search Input
    el.movieSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query === '') {
            state.filteredMovies = [...state.movies];
        } else {
            state.filteredMovies = state.movies.filter(movie => 
                movie.title.toLowerCase().includes(query) || 
                movie.genre.toLowerCase().includes(query)
            );
        }
        renderMoviesGrid();
    });

    // Movie list Filter Tabs
    el.tabNowShowing.addEventListener('click', () => {
        el.tabNowShowing.classList.add('active');
        el.tabUpcoming.classList.remove('active');
        state.activeMovieStatus = 'NOW_SHOWING';
        renderMoviesGrid();
    });

    el.tabUpcoming.addEventListener('click', () => {
        el.tabUpcoming.classList.add('active');
        el.tabNowShowing.classList.remove('active');
        state.activeMovieStatus = 'UPCOMING';
        renderMoviesGrid();
    });

    // Hero Book tickets button
    el.heroBookBtn.addEventListener('click', () => {
        if (state.selectedMovie) {
            openShowtimeSelector(state.selectedMovie);
        }
    });

    // Details Modal Book button
    el.detailBookBtn.addEventListener('click', () => {
        if (state.selectedMovie) {
            openShowtimeSelector(state.selectedMovie);
        }
    });

    // Seat selector checkout button
    el.proceedToPayBtn.addEventListener('click', () => {
        startCheckout();
    });

    // Checkout payment submission
    el.paymentForm.addEventListener('submit', processPayment);
    el.ticketCloseBtn.addEventListener('click', () => {
        closeAllModals();
        window.location.reload(); // reload to refresh seat availability in grids
    });

    // My Bookings trigger
    el.viewBookingsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openBookingsHistory();
    });

    // Close overlays
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeAllModals();
            }
        });
    });
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    // Login Form Submit
    el.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        el.loginError.classList.add('hidden');
        
        const loginData = {
            email: el.loginEmail.value,
            password: el.loginPassword.value
        };
        
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });
            
            if (res.ok) {
                const user = await res.json();
                loginUserSuccess(user);
                closeAllModals();
                
                // If they were in the middle of booking, resume it!
                if (state.selectedShow && state.selectedSeats.length > 0) {
                    startCheckout();
                }
            } else {
                const details = await res.json();
                el.loginError.textContent = details.error || "Authentication failed.";
                el.loginError.classList.remove('hidden');
            }
        } catch (err) {
            el.loginError.textContent = "Network error. Please try again.";
            el.loginError.classList.remove('hidden');
        }
    });

    // Register Form Submit
    el.registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        el.registerError.classList.add('hidden');
        el.registerSuccess.classList.add('hidden');
        
        const regData = {
            name: el.regName.value,
            email: el.regEmail.value,
            phone: el.regPhone.value,
            password: el.regPassword.value
        };
        
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(regData)
            });
            
            if (res.ok) {
                el.registerSuccess.textContent = "Account created! You can now log in using the Login tab.";
                el.registerSuccess.classList.remove('hidden');
                el.registerForm.reset();
            } else {
                const details = await res.json();
                el.registerError.textContent = details.error || "Registration failed.";
                el.registerError.classList.remove('hidden');
            }
        } catch (err) {
            el.registerError.textContent = "Network error. Please try again.";
            el.registerError.classList.remove('hidden');
        }
    });

    // Admin Dashboard triggers
    el.adminDashboardLink.addEventListener('click', (e) => {
        e.preventDefault();
        openAdminDashboard();
    });

    document.querySelectorAll('.admin-nav-tabs .admin-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            switchAdminTab(tabId);
        });
    });

    // Admin Form triggers
    el.adminAddMovieBtn.addEventListener('click', () => {
        el.addMovieFormBlock.classList.toggle('hidden');
    });
    el.cancelMovieBtn.addEventListener('click', () => {
        el.addMovieFormBlock.classList.add('hidden');
    });
    
    el.adminAddShowBtn.addEventListener('click', () => {
        el.addShowFormBlock.classList.toggle('hidden');
    });
    el.cancelShowBtn.addEventListener('click', () => {
        el.addShowFormBlock.classList.add('hidden');
    });

    // Admin Add Movie submit
    el.addMovieForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const movieObj = {
            title: document.getElementById('mFormTitle').value,
            genre: document.getElementById('mFormGenre').value,
            durationMinutes: parseInt(document.getElementById('mFormDuration').value),
            language: document.getElementById('mFormLanguage').value,
            posterUrl: document.getElementById('mFormPoster').value,
            releaseDate: document.getElementById('mFormRelease').value,
            status: document.getElementById('mFormStatus').value,
            description: document.getElementById('mFormDesc').value,
            trailerUrl: document.getElementById('mFormTrailer').value || null
        };

        try {
            const res = await fetch('/api/admin/movies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(movieObj)
            });

            if (res.ok) {
                el.addMovieForm.reset();
                el.addMovieFormBlock.classList.add('hidden');
                loadAdminMovies();
                fetchMovies(); // reload catalog
            } else {
                alert("Failed to save movie.");
            }
        } catch (err) {
            alert("Network error.");
        }
    });

    // Admin Add Show submit
    el.addShowForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const movieId = document.getElementById('sFormMovie').value;
        const screenId = document.getElementById('sFormScreen').value;
        const showDate = document.getElementById('sFormDate').value;
        const showTime = document.getElementById('sFormTime').value;
        
        const showObj = {
            movie: { id: parseInt(movieId) },
            screen: { id: parseInt(screenId) },
            showDate: showDate,
            startTime: `${showDate}T${showTime}:00`,
            priceRegular: parseFloat(document.getElementById('sFormRegular').value),
            pricePremium: parseFloat(document.getElementById('sFormPremium').value),
            priceRecliner: parseFloat(document.getElementById('sFormRecliner').value)
        };

        try {
            const res = await fetch('/api/admin/shows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(showObj)
            });

            if (res.ok) {
                el.addShowForm.reset();
                el.addShowFormBlock.classList.add('hidden');
                loadAdminShows();
            } else {
                alert("Failed to schedule show.");
            }
        } catch (err) {
            alert("Network error.");
        }
    });
}
