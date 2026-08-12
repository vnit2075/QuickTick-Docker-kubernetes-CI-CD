package com.quicktick.controller;

import com.quicktick.model.*;
import com.quicktick.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    // Get statistics for admin dashboard
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        long totalMovies = movieRepository.count();
        long totalUsers = userRepository.count();
        
        List<Booking> bookings = bookingRepository.findAll();
        long totalBookings = bookings.size();
        
        double totalRevenue = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                .mapToDouble(Booking::getTotalAmount)
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalMovies", totalMovies);
        stats.put("totalUsers", totalUsers);
        stats.put("totalBookings", totalBookings);
        stats.put("totalRevenue", totalRevenue);

        return ResponseEntity.ok(stats);
    }

    // Get all bookings in the system
    @GetMapping("/bookings")
    public List<Booking> getAllBookings() {
        return bookingRepository.findAllByOrderByBookingTimeDesc();
    }

    // Get all shows in the system
    @GetMapping("/shows")
    public List<Show> getAllShows() {
        return showRepository.findAll();
    }

    // Get all users in the system
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Create a new movie
    @PostMapping("/movies")
    public Movie createMovie(@RequestBody Movie movie) {
        return movieRepository.save(movie);
    }

    // Update a movie
    @PutMapping("/movies/{id}")
    public ResponseEntity<Movie> updateMovie(@PathVariable Long id, @RequestBody Movie movieDetails) {
        Movie movie = movieRepository.findById(id).orElse(null);
        if (movie == null) {
            return ResponseEntity.notFound().build();
        }

        movie.setTitle(movieDetails.getTitle());
        movie.setDescription(movieDetails.getDescription());
        movie.setDurationMinutes(movieDetails.getDurationMinutes());
        movie.setGenre(movieDetails.getGenre());
        movie.setLanguage(movieDetails.getLanguage());
        movie.setPosterUrl(movieDetails.getPosterUrl());
        movie.setTrailerUrl(movieDetails.getTrailerUrl());
        movie.setReleaseDate(movieDetails.getReleaseDate());
        movie.setStatus(movieDetails.getStatus());

        return ResponseEntity.ok(movieRepository.save(movie));
    }

    // Delete a movie
    @DeleteMapping("/movies/{id}")
    public ResponseEntity<?> deleteMovie(@PathVariable Long id) {
        if (!movieRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        movieRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // Create a new theater
    @PostMapping("/theaters")
    public Theater createTheater(@RequestBody Theater theater) {
        return theaterRepository.save(theater);
    }

    // Create a new show
    @PostMapping("/shows")
    public Show createShow(@RequestBody Show show) {
        return showRepository.save(show);
    }

    // Delete a show
    @DeleteMapping("/shows/{id}")
    public ResponseEntity<?> deleteShow(@PathVariable Long id) {
        if (!showRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        showRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
