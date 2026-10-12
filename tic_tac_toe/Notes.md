
## Tic Tac Toe

**Notes:** 

    1. Sign Conventions of class diagram
        a. Composition: (filled diamond head symbol) used for strong has a relations i.e the relational object get destroyed with the caller itself e.g Game and Board her in tic tac toe LLD.
        b. Aggegation: (empty diamond head symbol) used for weak relationship. The relational object lives independent and even after the destruction (of object in which it is being called) e.g Game and Player here in tic tac toe LLD.
        c. Inheritance: Uses the parent class
        d. Realization: Class implemeting some interface
        e. Association: A has-a relationship where class stored the refrence to it's relational class a field/attriute memeber
        f. Dependency: A weak has-a relationship where the dependency is used via object injected via some method (not stored internally)