<?php
    // Database information
    $db_hostname = "nimbus.rangitoto.school.nz";
    $db_port = "3307";
    $db_user = "2022164099";
    $db_password = "susboi123";
    $db_name = "student2022164099";
    $record_db = "record_table";
    $food_db = "food_table";
    $food_type_db = "food_type_table";
    $meal_db = "meal_table";
    $food_combo_db = "food_combo_table";
    $food_type_combo_db = "food_type_combo_table";

    $conn = new mysqli($db_hostname, $db_user, $db_password, $db_name, $db_port);

    // Text delimiting character
    $array_delimiter = ";";
    $info_delimiter = "|";
    $separator = ",";

    // Submitted Data
    $user_id = $_POST["userId"];
    $dates = $_POST["Date"];
    $food_types = $_POST["foodTypes"];
    $meals = $_POST["meals"];

    // Combine record tables and apply filters in one query
    $record_strs = "sss" . str_repeat("s", count($food_types) + count($meals));
    $food_type_params = rtrim(str_repeat("?, ", count($food_types)), ", ");
    $meal_params = rtrim(str_repeat("?, ", count($meals)), ", ");
    $stmt = $conn->prepare("SELECT record_id, date, meal_name, food_name, food_type FROM $db_name.$record_db INNER JOIN $db_name.$meal_db USING (meal_id) INNER JOIN $db_name.$food_combo_db USING (record_id) INNER JOIN $db_name.$food_db USING (food_id) INNER JOIN $db_name.$food_type_combo_db USING (record_id) INNER JOIN $db_name.$food_type_db USING (food_type_id) WHERE user_id=? AND date BETWEEN CAST(? as date) AND CAST(? as date) AND food_type IN ($food_type_params) AND meal_name IN ($meal_params) ORDER BY record_id;");
    $stmt->bind_param($record_strs, $user_id, ...$dates, ...$food_types, ...$meals);
    $stmt->execute();
    $result = $stmt->get_result();
    // Set result as array
    $results = [];
    while ($row = $result->fetch_assoc()) {
        $results[] = $row;
    }

    // Format result information into string to store in sessionStorage
    $record_id = "";
    $record_date = "";
    $record_meal = "";
    $record_foods = [];
    $record_food_types = [];
    $table_records = [];
    foreach ($results as $index=>$row) {
        $row = array_values($row);

        // Append same record information and reset for new record information
        if ($record_id) {
            if (!in_array($row[3], $record_foods)) {      
                $record_foods[] = $row[3];
            }
            if (!in_array($row[4], $record_food_types)) {       
                $record_food_types[] = $row[4];
            }
        } else {
            $record_id = $row[0];
            $record_date = $row[1];
            $record_meal = $row[2];
            $record_foods = [$row[3]];
            $record_food_types = [$row[4]];
        }

        // Add record to list
        if ($index + 1 == count($results) || $record_id != array_values($results[$index + 1])[0]) {
            $record_foods = implode($separator, $record_foods);
            $record_food_types = implode($separator, $record_food_types);
            $table_records[] = addslashes(implode($info_delimiter, [$record_id, $record_date, $record_meal, $record_foods, $record_food_types]));

            // Reset id for next record
            $record_id = "";
        }
    }
    $table_records = implode($array_delimiter, $table_records);

    echo "<script>sessionStorage.setItem('records', '$table_records')</script>";
    echo "<script>sessionStorage.setItem('action', 'record')</script>";

    mysqli_close($conn);

    // Return to main page
    echo "<script>window.history.go(-1);</script>";
?>
