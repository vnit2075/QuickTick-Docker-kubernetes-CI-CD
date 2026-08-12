package com.quicktick.repository;

import com.quicktick.model.ShowSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ShowSeatRepository extends JpaRepository<ShowSeat, Long> {
    List<ShowSeat> findByShowId(Long showId);
    List<ShowSeat> findByShowIdAndSeatIdIn(Long showId, List<Long> seatIds);
}
