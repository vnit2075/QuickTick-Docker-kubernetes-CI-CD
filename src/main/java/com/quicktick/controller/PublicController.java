package com.quicktick.controller;

import com.quicktick.model.*;
import com.quicktick.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class PublicController {

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private ShowSeatRepository showSeatRepository;

    // Get all movies
    @GetMapping("/movies")
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    // Get movies by status (NOW_SHOWING or UPCOMING)
    @GetMapping("/movies/status/{status}")
    public List<Movie> getMoviesByStatus(@PathVariable MovieStatus status) {
        return movieRepository.findByStatus(status);
    }

    // Get single movie details
    @GetMapping("/movies/{id}")
    public ResponseEntity<Movie> getMovieById(@PathVariable Long id) {
        return movieRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get all theaters
    @GetMapping("/theaters")
    public List<Theater> getAllTheaters() {
        return theaterRepository.findAll();
    }

    // Get theaters by city
    @GetMapping("/theaters/city/{city}")
    public List<Theater> getTheatersByCity(@PathVariable String city) {
        return theaterRepository.findByCity(city);
    }

    // Get shows for a movie and a specific date
    @GetMapping("/shows")
    public List<Show> getShows(
            @RequestParam Long movieId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return showRepository.findByMovieIdAndShowDate(movieId, date);
    }

    // Get show details including dynamically initialized seat states
    @GetMapping("/shows/{id}")
    public ResponseEntity<?> getShowDetails(@PathVariable Long id) {
        Show show = showRepository.findById(id).orElse(null);
        if (show == null) {
            return ResponseEntity.notFound().build();
        }

        List<ShowSeat> showSeats = showSeatRepository.findByShowId(id);
        if (showSeats.isEmpty()) {
            // Dynamically seed show seats if not initialized yet
            List<Seat> seats = seatRepository.findByScreenId(show.getScreen().getId());
            showSeats = new ArrayList<>();
            for (Seat seat : seats) {
                ShowSeat showSeat = ShowSeat.builder()
                        .show(show)
                        .seat(seat)
                        .status(ShowSeatStatus.AVAILABLE)
                        .build();
                showSeats.add(showSeat);
            }
            showSeats = showSeatRepository.saveAll(showSeats);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("show", show);
        response.put("seats", showSeats);
        return ResponseEntity.ok(response);
    }
}
