package com.rehabfit.repository;

import com.rehabfit.model.Progress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProgressRepository extends JpaRepository<Progress, Long> {
    List<Progress> findByUserId(String userId);
}