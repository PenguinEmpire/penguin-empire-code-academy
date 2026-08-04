# Alice's Kitchen — reconstructed scaffold

The source PDF (`content/source/alice-kitchen-project.txt`) points at a programiz project
with pre-written `Object` and `Kitchen` starter classes that we do not have. This is a
reconstruction, faithful to the API the PDF describes, verified with `javac` on JDK 25.

`stage4-complete.java` is the finished program for Unit J6 stage 4. Earlier stages are
subsets of it. Compile it with:

```bash
javac -d out stage4-complete.java && java -cp out Main
```

## Two deliberate changes from the PDF

1. **`Object` was renamed to `Item`.** Java already has a class called `java.lang.Object`
   that every class silently inherits from. Declaring your own `Object` shadows it and
   produces confusing errors the moment inheritance is taught, which is precisely what
   Unit J5 covers. `Item` keeps the same role with none of the collision.
2. **Everything is nested inside one `Main` class.** The sandbox runs single-file Java,
   so `Item`, `Food`, `Meal`, `Appliance`, `Person` and `Kitchen` are `static class`
   declarations inside `Main` rather than separate files.

## Coverage of the PDF's 20 steps

| Steps | Stage | What it exercises |
|---|---|---|
| 1–4 | 1 · Meet Alice | constructor, field, `getName`, printing |
| 5–9 | 2 · The Kitchen Grid | 2D array, `placeObject`, `moveObject`, resize to 5×7 |
| 10–17 | 3 · Appliances & Inventory | inheritance, proximity via `isNextTo`, `ArrayList` inventory, wash and eat |
| 18–20 | 4 · Recipes & Health | `Meal` built from ingredients, health bar, full story in `main` |

The bonus step (choose the kitchen dimensions) is satisfied by the `Kitchen(int rows, int cols)`
constructor, and every loop reads `floor.length` and `floor[0].length` rather than a fixed
number, so no other code changes when the size does.
