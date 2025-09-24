import React, { useState } from 'react';
import './BMI.css';

const DietPlanDisplay = ({ dietPlan, bmi, status }) => (
  <div className="show-results-udweight">
    <div className="results-heading">
      <h1>Results</h1>
      <h1>Status: {status}</h1>
      <hr color="blue"/>
      <p>Your BMI is: {bmi}</p>
    </div>

    <div className="underweight-results">
      <h2>{dietPlan.goal}</h2>

      <h3>General Instructions</h3>
      <ul>
        {dietPlan.instructions.map((tip, index) => (
          <li key={index}>{tip}</li>
        ))}
      </ul>

      <h3>Full Day Diet Plan</h3>
      {Object.entries(dietPlan.dietPlan).map(([mealName, mealData]) => (
        <div key={mealName} className="meal-block" style={{ marginBottom: '1.5rem' }}>
          <p><strong>Time:</strong> {mealData.time}</p>
          <ul>
            {mealData.items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      ))}

      <h3>Extra Tips</h3>
      <ul>
        {dietPlan.extraTips.map((tip, index) => (
          <li key={index}>{tip}</li>
        ))}
      </ul>
    </div>
  </div>
);

function BMI() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [status, setStatus] = useState('');
  const [age, setAge] = useState('');
  const [bmi, setBMI] = useState(null);

  const DietPlanForUnderweight = {
    goal: "Healthy Weight Gain for Underweight BMI",
    instructions: [
      "Eat every 2–3 hours",
      "Include protein in every meal",
      "Use healthy fats liberally",
      "Be consistent with the diet"
    ],
    dietPlan: {
      morning: {
        time: "7–8 AM",
        items: [
          "Soaked almonds (5–7)",
          "Walnuts (2–3)",
          "1 glass milk (full-fat or plant-based with peanut butter)",
          "1 banana or 2–3 dates"
        ]
      },
      breakfast: {
        time: "8:30–9:30 AM",
        items: [
          "2–3 eggs or paneer bhurji or tofu",
          "2 whole wheat breads or parathas with ghee",
          "1 glass fresh juice or lassi"
        ]
      },
      midMorningSnack: {
        time: "11 AM",
        items: [
          "Peanut butter sandwich or granola bar or trail mix",
          "Mango, banana or chiku fruit shake or buttermilk"
        ]
      },
      lunch: {
        time: "1–2 PM",
        items: [
          "1–2 cups rice or 2–3 rotis",
          "1 protein: dal, chole, rajma, or chicken/fish",
          "Vegetable sabzi",
          "Curd or raita",
          "Small portion of dessert (like kheer or dates)"
        ]
      },
      eveningSnack: {
        time: "5 PM",
        items: [
          "Dry fruits laddu or protein bar",
          "Milkshake or fruit smoothie"
        ]
      },
      dinner: {
        time: "8–9 PM",
        items: [
          "2–3 rotis or a rice bowl",
          "Protein: lentils, paneer, tofu, or lean meat",
          "Vegetable curry or sautéed vegetables",
          "Salad with olive oil or nuts"
        ]
      },
      bedtime: {
        time: "10–11 PM",
        items: [
          "Warm milk with turmeric or honey",
          "Handful of mixed nuts"
        ]
      }
    },
    extraTips: [
      "Add ghee, nuts, seeds, olive oil, and cheese to meals",
      "Do resistance training (like light weights) to gain muscle",
      "Stay hydrated but avoid drinking water before meals"
    ]
  };

  const DietPlanForNormalWeight = {
    goal: "Maintain Healthy Weight with Balanced Diet",
    instructions: [
      "Eat a balanced diet with all food groups",
      "Include fruits and vegetables daily",
      "Stay active with regular exercise",
      "Avoid excessive sugar and processed foods"
    ],
    dietPlan: {
      breakfast: {
        time: "7–8 AM",
        items: [
          "Oatmeal with fresh fruits and nuts",
          "1 glass low-fat milk or yogurt"
        ]
      },
      midMorningSnack: {
        time: "10–11 AM",
        items: [
          "Fresh fruit or nuts",
          "Green tea or herbal tea"
        ]
      },
      lunch: {
        time: "1–2 PM",
        items: [
          "1–2 rotis or rice",
          "Lean protein like chicken, fish, or legumes",
          "Vegetable sabzi or salad",
          "Curd or buttermilk"
        ]
      },
      eveningSnack: {
        time: "4–5 PM",
        items: [
          "Sprout salad or roasted chickpeas",
          "Fruit smoothie without added sugar"
        ]
      },
      dinner: {
        time: "7–8 PM",
        items: [
          "Grilled vegetables or salad",
          "Protein source like paneer, tofu or lean meat",
          "Small portion of carbs like roti or quinoa"
        ]
      }
    },
    extraTips: [
      "Drink plenty of water throughout the day",
      "Limit intake of fried and sugary foods",
      "Maintain regular physical activity"
    ]
  };

  const DietPlanForOverweight = {
    goal: "Weight Loss and Healthy Lifestyle for Overweight BMI",
    instructions: [
      "Control portion sizes",
      "Avoid sugary drinks and snacks",
      "Increase intake of fiber-rich foods",
      "Engage in regular physical activity"
    ],
    dietPlan: {
      breakfast: {
        time: "7–8 AM",
        items: [
          "Vegetable omelette or sprouts salad",
          "1 cup green tea or black coffee (no sugar)"
        ]
      },
      midMorningSnack: {
        time: "10–11 AM",
        items: [
          "Fruit like apple or orange",
          "Handful of nuts (almonds, walnuts)"
        ]
      },
      lunch: {
        time: "1–2 PM",
        items: [
          "Salad with lean protein (chicken, fish, dal)",
          "1 small bowl brown rice or 1–2 rotis",
          "Steamed or sautéed vegetables"
        ]
      },
      eveningSnack: {
        time: "4–5 PM",
        items: [
          "Roasted chana or sprouts",
          "Herbal tea"
        ]
      },
      dinner: {
        time: "7–8 PM",
        items: [
          "Soup or salad",
          "Grilled paneer/tofu or lean meat",
          "Vegetable stir-fry"
        ]
      }
    },
    extraTips: [
      "Avoid late-night eating",
      "Exercise daily, including cardio and strength training",
      "Stay hydrated with water, avoid sugary drinks"
    ]
  };

  const DietPlanForObese = {
    goal: "Weight Reduction and Improved Health for Obese BMI",
    instructions: [
      "Follow a calorie-controlled diet",
      "Limit intake of carbohydrates and fats",
      "Increase vegetables and lean proteins",
      "Consult a dietitian for personalized plan"
    ],
    dietPlan: {
      breakfast: {
        time: "7–8 AM",
        items: [
          "Low-fat yogurt with chia seeds and berries",
          "Green tea without sugar"
        ]
      },
      midMorningSnack: {
        time: "10–11 AM",
        items: [
          "Cucumber or carrot sticks",
          "Handful of nuts (unsalted)"
        ]
      },
      lunch: {
        time: "1–2 PM",
        items: [
          "Large salad with lean protein (grilled chicken, fish, tofu)",
          "1 small serving of brown rice or millet",
          "Steamed vegetables"
        ]
      },
      eveningSnack: {
        time: "4–5 PM",
        items: [
          "Herbal tea",
          "Fresh fruit (low sugar like berries or guava)"
        ]
      },
      dinner: {
        time: "7–8 PM",
        items: [
          "Clear vegetable soup",
          "Grilled lean protein",
          "Steamed or sautéed vegetables"
        ]
      }
    },
    extraTips: [
      "Avoid fried and processed foods",
      "Regular exercise, including walking and strength training",
      "Seek professional guidance if needed"
    ]
  };

  const handleCalc = () => {
    if (!weight || !height || !age || weight <= 0 || height <= 0 || age <= 0) {
      alert('Please enter valid weight, height, and age.');
      return;
    }

    const val = (weight / (height * height)).toFixed(2);
    const numericVal = parseFloat(val);
    setBMI(numericVal);

    if (age >= 18) {
      if (numericVal < 18.5) setStatus('Underweight');
      else if (numericVal < 25) setStatus('Normal weight');
      else if (numericVal < 30) setStatus('Overweight');
      else if (numericVal < 35) setStatus('Obese Class I');
      else if (numericVal < 40) setStatus('Obese Class II');
      else setStatus('Obese Class III');
    } else {
      setStatus('');
      setBMI(null);
    }
  };

  const renderDietPlan = () => {
    if (!status) return null;

    if (status === 'Underweight') return <DietPlanDisplay dietPlan={DietPlanForUnderweight} bmi={bmi} status={status} />;
    if (status === 'Normal weight') return <DietPlanDisplay dietPlan={DietPlanForNormalWeight} bmi={bmi} status={status} />;
    if (status === 'Overweight') return <DietPlanDisplay dietPlan={DietPlanForOverweight} bmi={bmi} status={status}/>;
    if (['Obese Class I', 'Obese Class II', 'Obese Class III'].includes(status))
      return <DietPlanDisplay dietPlan={DietPlanForObese} bmi={bmi} />;

    return null;
  };

  return (
    <div className="outer-main-card-layout">
      <div className="bmi-webapp-interface">
        <div className="heading-app">
          <h1>BMI Calculator</h1>
          <h3>Track your body mass index here!</h3>
        </div>

        <div className="input-group">
          <label htmlFor="weight">Weight (kg)</label>
          <input
            id="weight"
            type="number"
            placeholder="Enter your weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            min="0"
            step="0.1"
          />
        </div>

        <div className="input-group">
          <label htmlFor="height">Height (m)</label>
          <input
            id="height"
            type="number"
            placeholder="Enter your height"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>

        <div className="input-group">
          <label htmlFor="age">Age</label>
          <input
            id="age"
            type="number"
            placeholder="Enter your age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min="0"
          />
        </div>

        <div className="calc-btn">
          <button className="find-bmi" onClick={handleCalc}>
            Calculate 🩺
          </button>
        </div>
      </div>

      {renderDietPlan()}
    </div>
  );
}

export default BMI;
