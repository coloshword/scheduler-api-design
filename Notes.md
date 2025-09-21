### database indexing:
- indexing creates a fast lookup structure so you can query faster instead of an O(n) operation for checking 
- indexing on start_time --> allows the database to skip chunks of rows and go stragith for potential overlaps --> conflict dection closer to O(log n)
- by default indexing happens on the primary key 

----- 
creating an index in postgres 

CREATE INDEX <column> ON table(<column>)

### make a field nullable to make it optional
