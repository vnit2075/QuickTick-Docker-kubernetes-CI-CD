package com.quicktick.loader;

import com.quicktick.model.*;
import com.quicktick.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private ScreenRepository screenRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Only run seeder if database is empty
        if (userRepository.count() > 0) {
            System.out.println("Database already seeded. Skipping initialization.");
            return;
        }

        System.out.println("Starting database seeding...");

        // 1. Seed Users
        User admin = User.builder()
                .name("QuickTick Admin")
                .email("admin@quicktick.com")
                .password(passwordEncoder.encode("admin123"))
                .phone("9999999999")
                .role(Role.ADMIN)
                .build();

        User user = User.builder()
                .name("John Doe")
                .email("user@quicktick.com")
                .password(passwordEncoder.encode("user123"))
                .phone("8888888888")
                .role(Role.USER)
                .build();

        userRepository.save(admin);
        userRepository.save(user);

        // 2. Seed Movies
        Movie movie1 = Movie.builder()
                .title("Inception")
                .description("A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.")
                .durationMinutes(148)
                .genre("Sci-Fi / Action")
                .language("English")
                .posterUrl("https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60")
                .trailerUrl("https://www.youtube.com/embed/YoHD9XEInc0")
                .releaseDate(LocalDate.of(2010, 7, 16))
                .status(MovieStatus.NOW_SHOWING)
                .build();

        Movie movie2 = Movie.builder()
                .title("The Dark Knight")
                .description("When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.")
                .durationMinutes(152)
                .genre("Action / Crime / Drama")
                .language("English")
                .posterUrl("https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=500&auto=format&fit=crop&q=60")
                .trailerUrl("https://www.youtube.com/embed/LDG9bisJEaI")
                .releaseDate(LocalDate.of(2008, 7, 18))
                .status(MovieStatus.NOW_SHOWING)
                .build();

        Movie movie3 = Movie.builder()
                .title("Avatar: The Way of Water")
                .description("Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na'vi race.")
                .durationMinutes(192)
                .genre("Sci-Fi / Adventure")
                .language("English")
                .posterUrl("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60")
                .trailerUrl("https://www.youtube.com/embed/d9MyW72ELq0")
                .releaseDate(LocalDate.of(2022, 12, 16))
                .status(MovieStatus.NOW_SHOWING)
                .build();

        Movie movie4 = Movie.builder()
                .title("Dune: Part Two")
                .description("Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.")
                .durationMinutes(166)
                .genre("Sci-Fi / Adventure")
                .language("English")
                .posterUrl("https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&auto=format&fit=crop&q=60")
                .trailerUrl("https://www.youtube.com/embed/Way9Dexny3w")
                .releaseDate(LocalDate.of(2024, 3, 1))
                .status(MovieStatus.NOW_SHOWING)
                .build();

        Movie upcomingMovie = Movie.builder()
                .title("Spider-Man: Beyond the Spider-Verse")
                .description("The epic conclusion to Miles Morales' multiverse journey as he faces off against the Spot and forces across the Spider-Verse.")
                .durationMinutes(140)
                .genre("Animation / Action")
                .language("English")
                .posterUrl("https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500&auto=format&fit=crop&q=60")
                .trailerUrl("https://www.youtube.com/embed/embed-mock")
                .releaseDate(LocalDate.of(2027, 5, 1))
                .status(MovieStatus.UPCOMING)
                .build();

        movieRepository.save(movie1);
        movieRepository.save(movie2);
        movieRepository.save(movie3);
        movieRepository.save(movie4);
        movieRepository.save(upcomingMovie);

        // 3. Seed Theaters
        Theater theater1 = Theater.builder()
                .name("PVR: Forum Mall")
                .city("Bangalore")
                .address("Koramangala, Hosur Road, Bangalore - 560029")
                .build();

        Theater theater2 = Theater.builder()
                .name("Inox: Lido Mall")
                .city("Bangalore")
                .address("Ulsoor, Swami Vivekananda Road, Bangalore - 560008")
                .build();

        Theater theater3 = Theater.builder()
                .name("IMAX: Nexus Mall")
                .city("Hyderabad")
                .address("Kukatpally, Hyderabad - 500072")
                .build();

        theaterRepository.save(theater1);
        theaterRepository.save(theater2);
        theaterRepository.save(theater3);

        // 4. Seed Screens & Dynamic Seats
        Screen screen1 = Screen.builder().name("Audi 1").theater(theater1).totalSeats(50).build();
        Screen screen2 = Screen.builder().name("Audi 2").theater(theater1).totalSeats(50).build();
        Screen screen3 = Screen.builder().name("Screen 1").theater(theater2).totalSeats(50).build();
        Screen screen4 = Screen.builder().name("IMAX screen").theater(theater3).totalSeats(50).build();

        screenRepository.save(screen1);
        screenRepository.save(screen2);
        screenRepository.save(screen3);
        screenRepository.save(screen4);

        // Populate Seats for each screen (50 seats: A1-A10, B1-B10, C1-C10, D1-D10, E1-E10)
        seedSeatsForScreen(screen1);
        seedSeatsForScreen(screen2);
        seedSeatsForScreen(screen3);
        seedSeatsForScreen(screen4);

        // 5. Seed Shows (For today and tomorrow)
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);
        LocalDate dayAfter = today.plusDays(2);

        // Shows for Today
        createShow(movie1, screen1, today, LocalTime.of(10, 0), 180, 280, 450);
        createShow(movie1, screen1, today, LocalTime.of(14, 30), 180, 280, 450);
        createShow(movie2, screen1, today, LocalTime.of(18, 0), 200, 300, 500);
        createShow(movie3, screen2, today, LocalTime.of(12, 0), 180, 280, 450);
        createShow(movie4, screen3, today, LocalTime.of(15, 0), 180, 280, 450);
        createShow(movie4, screen4, today, LocalTime.of(19, 0), 250, 380, 600);

        // Shows for Tomorrow
        createShow(movie1, screen1, tomorrow, LocalTime.of(10, 0), 180, 280, 450);
        createShow(movie2, screen1, tomorrow, LocalTime.of(14, 0), 200, 300, 500);
        createShow(movie2, screen2, tomorrow, LocalTime.of(18, 30), 200, 300, 500);
        createShow(movie3, screen3, tomorrow, LocalTime.of(11, 30), 180, 280, 450);
        createShow(movie4, screen4, tomorrow, LocalTime.of(16, 0), 250, 380, 600);

        // Shows for Day After
        createShow(movie1, screen1, dayAfter, LocalTime.of(10, 0), 180, 280, 450);
        createShow(movie3, screen2, dayAfter, LocalTime.of(14, 30), 180, 280, 450);
        createShow(movie4, screen4, dayAfter, LocalTime.of(19, 0), 250, 380, 600);

        System.out.println("Database seeding completed successfully!");
    }

    private void seedSeatsForScreen(Screen screen) {
        List<Seat> seats = new ArrayList<>();
        
        // Row A: Recliners (10 seats)
        for (int i = 1; i <= 10; i++) {
            seats.add(Seat.builder()
                    .screen(screen)
                    .seatNumber("A" + i)
                    .rowLabel("A")
                    .seatType(SeatType.RECLINER)
                    .build());
        }

        // Row B & C: Premium (10 seats each)
        for (String row : new String[]{"B", "C"}) {
            for (int i = 1; i <= 10; i++) {
                seats.add(Seat.builder()
                        .screen(screen)
                        .seatNumber(row + i)
                        .rowLabel(row)
                        .seatType(SeatType.PREMIUM)
                        .build());
            }
        }

        // Row D & E: Regular (10 seats each)
        for (String row : new String[]{"D", "E"}) {
            for (int i = 1; i <= 10; i++) {
                seats.add(Seat.builder()
                        .screen(screen)
                        .seatNumber(row + i)
                        .rowLabel(row)
                        .seatType(SeatType.REGULAR)
                        .build());
            }
        }
        
        seatRepository.saveAll(seats);
    }

    private void createShow(Movie movie, Screen screen, LocalDate date, LocalTime time, double regular, double premium, double recliner) {
        Show show = Show.builder()
                .movie(movie)
                .screen(screen)
                .showDate(date)
                .startTime(LocalDateTime.of(date, time))
                .priceRegular(regular)
                .pricePremium(premium)
                .priceRecliner(recliner)
                .build();
        showRepository.save(show);
    }
}
