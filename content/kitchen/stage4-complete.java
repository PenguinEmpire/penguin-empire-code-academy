import java.util.ArrayList;

public class Main {

    // ---------- Item: anything that can sit in the kitchen ----------
    static class Item {
        private String name;
        private int row = -1;
        private int col = -1;

        public Item(String name) {
            this.name = name;
        }
        public String getName() { return name; }
        public int getRow() { return row; }
        public int getCol() { return col; }
        public void setPosition(int row, int col) { this.row = row; this.col = col; }
        public String symbol() { return name.substring(0, 1).toUpperCase(); }
    }

    // ---------- Food ----------
    static class Food extends Item {
        private boolean clean = false;
        public Food(String name) { super(name); }
        public boolean isClean() { return clean; }
        public void wash() { clean = true; }
    }

    // ---------- Meal: made of foods ----------
    static class Meal extends Food {
        private ArrayList<String> ingredients = new ArrayList<>();
        public Meal(String name, ArrayList<String> ingredients) {
            super(name);
            this.ingredients = ingredients;
            wash();
        }
        public ArrayList<String> getIngredients() { return ingredients; }
    }

    // ---------- Appliance ----------
    static class Appliance extends Item {
        public Appliance(String name) { super(name); }
    }

    // ---------- Person ----------
    static class Person extends Item {
        private ArrayList<Item> inventory = new ArrayList<>();
        private int health = 0;
        public Person(String name) { super(name); }
        public ArrayList<Item> getInventory() { return inventory; }
        public int getHealth() { return health; }
        public void eat(Food food) {
            if (!food.isClean()) { System.out.println(getName() + " will not eat a dirty " + food.getName()); return; }
            inventory.remove(food);
            health += 25;
            if (health > 100) health = 100;
            System.out.println(getName() + " ate the " + food.getName() + ". Health is now " + health);
        }
    }

    // ---------- Kitchen ----------
    static class Kitchen {
        private Item[][] floor;
        public Kitchen(int rows, int cols) { floor = new Item[rows][cols]; }

        public void placeObject(Item item, int row, int col) {
            if (row < 0 || row >= floor.length || col < 0 || col >= floor[0].length) {
                System.out.println("Cannot place " + item.getName() + " outside the kitchen");
                return;
            }
            floor[row][col] = item;
            item.setPosition(row, col);
        }

        public void moveObject(Item item, String direction) {
            int r = item.getRow();
            int c = item.getCol();
            if (direction.equals("up")) r--;
            else if (direction.equals("down")) r++;
            else if (direction.equals("left")) c--;
            else if (direction.equals("right")) c++;
            else { System.out.println("Unknown direction: " + direction); return; }

            if (r < 0 || r >= floor.length || c < 0 || c >= floor[0].length) {
                System.out.println(item.getName() + " cannot move " + direction + ", that is a wall");
                return;
            }
            floor[item.getRow()][item.getCol()] = null;
            floor[r][c] = item;
            item.setPosition(r, c);
        }

        public boolean isNextTo(Item a, Item b) {
            int dr = Math.abs(a.getRow() - b.getRow());
            int dc = Math.abs(a.getCol() - b.getCol());
            return dr + dc == 1;
        }

        public void printKitchen() {
            System.out.print("   ");
            for (int c = 0; c < floor[0].length; c++) System.out.print(c + " ");
            System.out.println();
            for (int r = 0; r < floor.length; r++) {
                System.out.print(r + "  ");
                for (int c = 0; c < floor[r].length; c++) {
                    System.out.print((floor[r][c] == null ? "." : floor[r][c].symbol()) + " ");
                }
                System.out.println();
            }
        }
    }

    public static void main(String[] args) {
        Kitchen kitchen = new Kitchen(5, 7);
        Person alice = new Person("Alice");
        Appliance fridge = new Appliance("Fridge");
        Appliance sink = new Appliance("Sink");

        kitchen.placeObject(alice, 3, 2);
        kitchen.placeObject(fridge, 0, 6);
        kitchen.placeObject(sink, 4, 0);
        kitchen.printKitchen();

        System.out.println();
        kitchen.moveObject(alice, "up");
        kitchen.moveObject(alice, "right");
        kitchen.printKitchen();

        System.out.println();
        Food tomato = new Food("tomato");
        alice.getInventory().add(tomato);
        System.out.println("Alice picked up a " + tomato.getName());
        alice.eat(tomato);
        tomato.wash();
        alice.getInventory().add(tomato);
        alice.eat(tomato);

        System.out.println();
        ArrayList<String> recipe = new ArrayList<>();
        recipe.add("tomato");
        recipe.add("cucumber");
        Meal atrocity = new Meal("atrocity", recipe);
        alice.getInventory().add(atrocity);
        System.out.println("Made a meal called " + atrocity.getName() + " from " + atrocity.getIngredients());
        alice.eat(atrocity);
        System.out.println("Final health: " + alice.getHealth());
    }
}
