⚖️ Seesaw Simulation

This is an interactive seesaw (balance beam) simulation built using HTML, CSS, and JavaScript.
Users can click on the beam to drop weights of random mass on either side, and the beam will tilt dynamically based on torque calculations.
All weights are saved locally so that the state is restored even after reloading the page.

🧠 Thought Process & Design Decisions

The main goal was to simulate rotational balance in a simple and visual way; this was ideal for demonstrating the concepts of torque and balance in physics.

Key design ideas:

1.User Interaction:
Clicking anywhere on the beam adds a new random weight (1–10 kg).
The position relative to the center determines whether the beam will descend to the left or right.

2.Physical Logic:
Torque is calculated as torque = distance × weight.
The difference between the left and right torques determines the beam's rotation angle.
For a realistic visual, the maximum tilt is limited to ±30°.

3.Smooth Animation:
Instead of instantly jumping to the new angle, the code uses the requestAnimationFrame() function to create smooth motion.
This increases realism and creates a gradual balancing effect.

4.Persistence:
The current state (weights and positions) is stored in localStorage.
When the page loads, the app restores the previous weights and beam position.

5.User Interface and Logging:
A small logging panel records each action (e.g., added weights, reset).
The interface also displays the total mass on each side and the current angle in degrees.
