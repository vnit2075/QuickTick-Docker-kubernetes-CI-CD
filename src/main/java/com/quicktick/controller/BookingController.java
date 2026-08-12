package com.quicktick.controller;

import com.quicktick.dto.BookingRequest;
import com.quicktick.model.*;
import com.quicktick.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private ShowSeatRepository showSeatRepository;

    @Autowired
    private UserRepository userRepository;

    // Create a new booking
    @PostMapping
    @Transactional
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest bookingRequest) {
        // 1. Get authenticated user
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        // 2. Fetch Show
        Show show = showRepository.findById(bookingRequest.getShowId()).orElse(null);
        if (show == null) {
            return ResponseEntity.badRequest().body("Show not found");
        }

        // 3. Fetch Show Seats
        List<ShowSeat> showSeats = showSeatRepository.findByShowIdAndSeatIdIn(
                bookingRequest.getShowId(), bookingRequest.getSeatIds());

        if (showSeats.size() != bookingRequest.getSeatIds().size()) {
            return ResponseEntity.badRequest().body("Some seats do not exist for this show");
        }

        // 4. Verify all selected seats are available
        double totalAmount = 0.0;
        List<ShowSeat> seatsToBook = new ArrayList<>();
        
        for (ShowSeat showSeat : showSeats) {
            if (showSeat.getStatus() != ShowSeatStatus.AVAILABLE) {
                return ResponseEntity.badRequest().body("Seat " + showSeat.getSeat().getSeatNumber() + " is already booked or locked");
            }
            
            // Calculate price based on seat type
            SeatType seatType = showSeat.getSeat().getSeatType();
            double seatPrice = 0.0;
            switch (seatType) {
                case REGULAR:
                    seatPrice = show.getPriceRegular();
                    break;
                case PREMIUM:
                    seatPrice = show.getPricePremium();
                    break;
                case RECLINER:
                    seatPrice = show.getPriceRecliner();
                    break;
            }
            totalAmount += seatPrice;
            seatsToBook.add(showSeat);
        }

        // 5. Add static convenience fee (e.g. 30 rupees per ticket)
        double convenienceFee = 30.0 * seatsToBook.size();
        totalAmount += convenienceFee;

        // 6. Create booking
        Booking booking = Booking.builder()
                .user(user)
                .show(show)
                .bookingTime(LocalDateTime.now())
                .totalAmount(totalAmount)
                .status(BookingStatus.CONFIRMED)
                .build();

        // Save booking first to get its ID
        booking = bookingRepository.save(booking);

        // 7. Update and associate seats
        for (ShowSeat showSeat : seatsToBook) {
            showSeat.setStatus(ShowSeatStatus.BOOKED);
            showSeat.setBooking(booking);
        }
        showSeatRepository.saveAll(seatsToBook);

        // Fetch fully populated booking object to return (with lazy relations populated)
        Booking finalBooking = bookingRepository.findById(booking.getId()).orElse(booking);
        return ResponseEntity.ok(finalBooking);
    }

    // Get bookings of currently logged in user
    @GetMapping
    public ResponseEntity<?> getMyBookings() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        List<Booking> bookings = bookingRepository.findByUserIdOrderByBookingTimeDesc(user.getId());
        return ResponseEntity.ok(bookings);
    }

    // Get booking details by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        Booking booking = bookingRepository.findById(id).orElse(null);
        if (booking == null) {
            return ResponseEntity.notFound().build();
        }

        // Verify authorization (only owner user or ADMIN can view it)
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        if (user.getRole() != Role.ADMIN && !booking.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        return ResponseEntity.ok(booking);
    }
}
