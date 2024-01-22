'''
This file was an initial demo for Zark.
Made with the help of a large language model,
Python was the easiest way to verify the data
and get a simple demo working.
Now that this is done (01/22/2024),
I'll be working on the JavaScript edition.
'''

import xml.etree.ElementTree as ET
import networkx as nx
import matplotlib.pyplot as plt
import random

# Load the exported XML file
tree = ET.parse('assets/ZARK.drawio.xml')
root = tree.getroot()

# Create a directed graph using NetworkX
flowchart_graph = nx.DiGraph()

# Dictionary to store edges temporarily
edges = {}

# Iterate through mxCell elements
for element in root.findall('.//mxCell'):
    id = element.get('id')
    source = element.get('source')
    target = element.get('target')
    value = element.get('value')
    style = element.get('style')
    is_edge_label = style and style.startswith("edgeLabel")

    # Add vertex to graph
    if not is_edge_label and value is not None and source is None and target is None:
        flowchart_graph.add_node(id, label=value)
    elif source is not None and target is not None:
        edges[id] = (source, target)
        if value is not None:
            flowchart_graph.add_edge(source, target, label=value)
        else:
            flowchart_graph.add_edge(source, target)

# Add edge labels to the graph
for element in root.findall('.//mxCell'):
    edge_id = element.get('parent')
    value = element.get('value')
    style = element.get('style')
    is_edge_label = style and style.startswith("edgeLabel")

    if is_edge_label and edge_id is not None and value is not None:
        source, target = edges[edge_id]
        flowchart_graph[source][target]['label'] = value

# Print nodes and edges
# print("Nodes:", flowchart_graph.nodes(data=True))
# print("Edges:", flowchart_graph.edges())

# Visualization (optional)
# pos = nx.spring_layout(flowchart_graph)
# labels = nx.get_node_attributes(flowchart_graph, 'label')
# nx.draw(flowchart_graph, pos, with_labels=True, labels=labels, node_size=700, node_color='lightblue', font_size=8)
# plt.show()

# Print the contents of the graph
for node in flowchart_graph.nodes():
    value = flowchart_graph.nodes[node]['label']
    targets = list(flowchart_graph.successors(node))
    sources = list(flowchart_graph.predecessors(node))

    decisions = []
    for target in targets:
        t = flowchart_graph[node][target]
        if 'label' in t:
            decisions.append(t['label'])
        else:
            decisions.append(target)

    # print(f"[{node}]\n{value}\nPossible outcomes: {decisions}\nPossible to get to from: {sources}\n")

# Start the game
current_node = next(iter(flowchart_graph.nodes()))
while True:
    print(f"Current node: {current_node}")
    value = flowchart_graph.nodes[current_node]['label']
    print(f"{value}\n")

    targets = list(flowchart_graph.successors(current_node))
    if len(targets) == 0:
        print("Thanks for playing!")
        break

    decisions = []
    should_pick_random = True
    for i, target in enumerate(targets):
        t = flowchart_graph[current_node][target]
        if 'label' in t:
            should_pick_random = False
            decisions.append((i + 1, t['label']))
        else:
            decisions.append((i + 1, target))

    if should_pick_random:
        print("Picking a random choice as there is no decision...")
        choice = random.randint(1, len(targets))
        current_node = targets[choice - 1]
        print(f"Choice {choice} has been selected")
        print(f"Traveling...")
        continue

    print("Decisions:")
    for choice, option in decisions:
        print(f"{choice}. {option}")

    user_input = input("Enter your choice (1, 2, 3, ...): ")
    try:
        choice = int(user_input)
        if 1 <= choice <= len(targets):
            current_node = targets[choice - 1]
        else:
            print("Invalid choice. Please enter a valid number.")
    except ValueError:
        print("Invalid input. Please enter a number.")