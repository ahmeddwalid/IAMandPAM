"""Part 1 flagship video: What is IAM & PAM?

Render with:
    manim render videos/part1_scenes.py Part1All -r 1920,1080 --fps 30
"""

import json
from pathlib import Path

from manim import (
    AnimationGroup, Arc, Arrow, Circle, Create, DashedLine, DOWN, FadeIn,
    Indicate, LEFT, Line, PI, RIGHT, RoundedRectangle, Scene, Text, UP,
    VGroup, config,
)

from theme import (
    DEEP_RED, FOREST, HEIGHT, INK, INK_SOFT, OCHRE, OCHRE_DARK, PAPER,
    SANS, SERIF, SITE_BG, WARM_1, WIDTH, FPS,
)

config.background_color = SITE_BG
config.pixel_width = WIDTH
config.pixel_height = HEIGHT
config.frame_rate = FPS

DUR = json.loads(
    (Path(__file__).parent / "audio" / "part1_durations.json").read_text()
)


def heading(text: str):
    return Text(text, font=SERIF, weight="BOLD", color=INK, font_size=52)


def card(w, h, label, gloss, border=WARM_1):
    box = RoundedRectangle(
        corner_radius=0.08, width=w, height=h,
        stroke_color=border, stroke_width=4,
        fill_color=PAPER, fill_opacity=0.9,
    )
    term = Text(label, font=SANS, weight="BOLD", color=INK, font_size=44)
    line = Line(
        box.get_center() + LEFT * (w / 2 - 40),
        box.get_center() + RIGHT * (w / 2 - 40),
        stroke_color=WARM_1, stroke_width=2,
    )
    gloss_text = Text(gloss, font=SANS, color=INK_SOFT, font_size=30)
    group = VGroup(box, term, line, gloss_text)
    term.move_to(box.get_top() + DOWN * 0.85)
    line.move_to(box.get_top() + DOWN * 1.55)
    gloss_text.move_to(box.get_top() + DOWN * 2.35)
    return group


def arrow(from_edge, to_edge, color=INK_SOFT, dashed=False):
    a = Arrow(
        from_edge, to_edge, buff=0.12, stroke_width=6,
        color=color, max_tip_length_to_length_ratio=0.09,
    )
    return DashedLine(
        a.get_start(), a.get_end(), color=color, stroke_width=6, dash_length=14,
        dashed_ratio=0.6,
    ) if dashed else a


def hold(scene, scene_id, build_time):
    scene.wait(max(0.0, DUR[scene_id] - build_time) + 0.35)


class Part1All(Scene):
    def construct(self):
        self.scene_title()
        self.scene_objects()
        self.scene_aaa()
        self.scene_lifecycle()
        self.scene_least()
        self.scene_pam()
        self.scene_iam_vs_pam()
        self.scene_outro()

    # ------------------------------------------------------------ scenes

    def scene_title(self):
        shackle = Arc(
            radius=0.52, start_angle=PI, angle=PI,
            color=OCHRE, stroke_width=14,
        )
        body = RoundedRectangle(
            corner_radius=0.09, width=1.1, height=0.82,
            stroke_color=OCHRE, stroke_width=14,
            fill_color=SITE_BG, fill_opacity=1,
        )
        body.next_to(shackle, DOWN, buff=0.02)
        keyhole = Circle(radius=0.12, stroke_color=OCHRE, stroke_width=10)
        keyhole.move_to(body)
        lock = VGroup(shackle, body, keyhole).scale(0.9).move_to(UP * 1.9)

        title = Text(
            "What is IAM & PAM?", font=SERIF, weight="BOLD",
            color=INK, font_size=88,
        ).move_to(UP * 0.15)
        rule = Line(
            LEFT * 1.4, RIGHT * 1.4, stroke_color=OCHRE, stroke_width=7,
        ).next_to(title, DOWN, buff=0.5)
        subtitle = Text(
            "Identity security, explained",
            font=SANS, color=INK_SOFT, font_size=42,
        ).next_to(rule, DOWN, buff=0.45)

        self.play(FadeIn(lock, shift=DOWN * 0.3), run_time=1.0)
        self.play(FadeIn(title, shift=UP * 0.2), run_time=0.8)
        self.play(Create(rule), run_time=0.5)
        self.play(FadeIn(subtitle, shift=UP * 0.15), run_time=0.7)
        hold(self, "title", 3.0)

    def scene_objects(self):
        head = heading("The objects of identity").to_edge(UP, buff=0.8)
        self.play(FadeIn(head, shift=DOWN * 0.15), run_time=0.6)

        specs = [
            ("Identity", "record for a person, device, or service"),
            ("Account", "credentials on one specific system"),
            ("Attribute", "a fact attached to the identity"),
            ("Entitlement", "a permission granted to an identity"),
        ]
        cards = []
        for i, (label, gloss) in enumerate(specs):
            c = card(760, 200, label, gloss)
            c.move_to(LEFT * 480 + RIGHT * (i % 2) * 960
                      + UP * 130 - DOWN * (i // 2) * 480)
            cards.append(c)

        for c in cards:
            self.play(FadeIn(c, shift=UP * 0.25), run_time=0.5)
        hold(self, "objects", 2.3)

    def scene_aaa(self):
        head = heading("The AAA model").to_edge(UP, buff=0.8)
        self.play(FadeIn(head, shift=DOWN * 0.15), run_time=0.6)

        user = card(250, 150, "User", "", border=OCHRE)
        user.move_to(LEFT * 760)
        stages = [
            ("Authentication", "who you are"),
            ("Authorization", "what you may do"),
            ("Accounting", "what you did"),
        ]
        boxes = [user]
        for i, (label, sub) in enumerate(stages):
            b = card(300, 150, label, sub, border=OCHRE)
            b.move_to(LEFT * 380 + RIGHT * i * 620)
            boxes.append(b)

        arrows = []
        for i in range(3):
            a = arrow(boxes[i].get_right(), boxes[i + 1].get_left())
            arrows.append(a)

        self.play(FadeIn(user, shift=UP * 0.2), run_time=0.5)
        for a, b in zip(arrows, boxes[1:]):
            self.play(Create(a), run_time=0.35)
            self.play(FadeIn(b, shift=UP * 0.2), run_time=0.5)
        hold(self, "aaa", 3.1)

    def scene_lifecycle(self):
        head = heading("Identity is a lifecycle").to_edge(UP, buff=0.8)
        self.play(FadeIn(head, shift=DOWN * 0.15), run_time=0.6)

        nodes = []
        for i, label in enumerate(["Joiner", "Mover", "Leaver"]):
            b = card(340, 170, label, "", border=OCHRE)
            b.move_to(LEFT * 560 + RIGHT * i * 560)
            nodes.append(b)

        arrows = []
        for i in range(2):
            arrows.append(arrow(nodes[i].get_right(), nodes[i + 1].get_left()))

        sources = Text(
            "Sources of truth: HR for people, contracts for vendors, "
            "registries for machines",
            font=SANS, color=INK_SOFT, font_size=34,
        ).to_edge(DOWN, buff=1.1)

        self.play(FadeIn(nodes[0], shift=UP * 0.2), run_time=0.5)
        for a, b in zip(arrows, nodes[1:]):
            self.play(Create(a), run_time=0.35)
            self.play(FadeIn(b, shift=UP * 0.2), run_time=0.5)
        self.play(FadeIn(sources, shift=UP * 0.15), run_time=0.6)
        hold(self, "lifecycle", 3.0)

    def scene_least(self):
        head = heading("Least privilege").to_edge(UP, buff=0.8)
        self.play(FadeIn(head, shift=DOWN * 0.15), run_time=0.6)

        outer = RoundedRectangle(
            corner_radius=0.06, width=1380, height=540,
            stroke_color=WARM_1, stroke_width=4,
            fill_color=PAPER, fill_opacity=0.7,
        ).move_to(DOWN * 0.2)
        outer_label = Text(
            "All access", font=SANS, color=INK_SOFT, font_size=36,
        ).move_to(outer.get_top() + DOWN * 0.75 + LEFT * 4.4)

        mid = RoundedRectangle(
            corner_radius=0.06, width=900, height=330,
            stroke_color=OCHRE, stroke_width=4,
            fill_color=SITE_BG, fill_opacity=1,
        ).move_to(DOWN * 0.2)
        mid_label = Text(
            "Job needs", font=SANS, color=OCHRE_DARK, font_size=36,
        ).move_to(mid.get_top() + DOWN * 0.75 + LEFT * 2.4)

        inner = RoundedRectangle(
            corner_radius=0.06, width=420, height=140,
            stroke_color=OCHRE_DARK, stroke_width=4,
            fill_color=OCHRE, fill_opacity=0.16,
        ).move_to(DOWN * 0.2)
        inner_label = Text(
            "Minimum", font=SANS, weight="BOLD", color=OCHRE_DARK,
            font_size=38,
        ).move_to(inner)

        caption = Text(
            "Grant the minimum, for the minimum time. Verify continuously.",
            font=SANS, color=INK_SOFT, font_size=36,
        ).to_edge(DOWN, buff=1.1)

        self.play(FadeIn(outer, shift=UP * 0.2), run_time=0.6)
        self.play(FadeIn(outer_label), run_time=0.4)
        self.play(FadeIn(mid, shift=UP * 0.15), run_time=0.6)
        self.play(FadeIn(mid_label), run_time=0.4)
        self.play(FadeIn(inner, shift=UP * 0.1), run_time=0.6)
        self.play(FadeIn(inner_label), run_time=0.4)
        self.play(FadeIn(caption, shift=UP * 0.15), run_time=0.6)
        hold(self, "least", 4.2)

    def scene_pam(self):
        head = heading("Privileged access concentrates risk").to_edge(
            UP, buff=0.8)
        self.play(FadeIn(head, shift=DOWN * 0.15), run_time=0.6)

        accounts = []
        for i, label in enumerate(
                ["Domain admin", "Root account", "Service account",
                 "Break-glass"]):
            b = card(430, 105, label, "", border=DEEP_RED)
            b.move_to(LEFT * 700 + UP * 170 - DOWN * i * 205)
            accounts.append(b)

        vault = card(340, 300, "PAM vault", "store · broker · record",
                     border=OCHRE)
        vault.move_to(RIGHT * 180)
        target = card(330, 210, "Target systems", "servers · DBs · cloud",
                      border=FOREST)
        target.move_to(RIGHT * 660)

        jit = Text(
            "JIT: request → approve → time-boxed grant → review",
            font=SANS, color=INK_SOFT, font_size=32,
        ).to_edge(DOWN, buff=1.1)

        self.play(
            *[FadeIn(b, shift=UP * 0.2) for b in accounts], run_time=1.1)
        a1 = arrow(accounts[0].get_right() + DOWN * 1.4, vault.get_left())
        a2 = arrow(vault.get_right(), target.get_left())
        self.play(Create(a1), run_time=0.4)
        self.play(FadeIn(vault, shift=UP * 0.2), run_time=0.5)
        self.play(Create(a2), run_time=0.4)
        self.play(FadeIn(target, shift=UP * 0.2), run_time=0.5)
        self.play(FadeIn(jit, shift=UP * 0.15), run_time=0.6)
        hold(self, "pam", 3.6)

    def scene_iam_vs_pam(self):
        head = heading("One program, two disciplines").to_edge(UP, buff=0.8)
        self.play(FadeIn(head, shift=DOWN * 0.15), run_time=0.6)

        iam = Circle(radius=330, stroke_color=OCHRE, stroke_width=7)
        iam.move_to(LEFT * 360 + DOWN * 0.35)
        pam = Circle(radius=330, stroke_color=FOREST, stroke_width=7)
        pam.move_to(RIGHT * 360 + DOWN * 0.35)

        iam_title = Text(
            "IAM", font=SERIF, weight="BOLD", color=INK, font_size=72,
        ).move_to(iam.get_center() + UP * 0.4)
        iam_sub = Text(
            "everyday access\nfor everyone", font=SANS, color=INK_SOFT,
            font_size=32,
        ).move_to(iam.get_center() + DOWN * 1.0)

        pam_title = Text(
            "PAM", font=SERIF, weight="BOLD", color=INK, font_size=72,
        ).move_to(pam.get_center() + UP * 0.4)
        pam_sub = Text(
            "the dangerous few", font=SANS, color=INK_SOFT, font_size=32,
        ).move_to(pam.get_center() + DOWN * 1.0)

        shared = Text(
            "shared governance", font=SANS, color=INK_SOFT, font_size=30,
        ).move_to(DOWN * 0.35)

        self.play(FadeIn(iam, shift=UP * 0.2), run_time=0.6)
        self.play(FadeIn(iam_title), FadeIn(iam_sub), run_time=0.6)
        self.play(FadeIn(pam, shift=UP * 0.2), run_time=0.6)
        self.play(FadeIn(pam_title), FadeIn(pam_sub), run_time=0.6)
        self.play(FadeIn(shared), run_time=0.5)
        hold(self, "iamvs", 3.2)

    def scene_outro(self):
        title = Text(
            "IAM & PAM Reference", font=SERIF, weight="BOLD",
            color=INK, font_size=84,
        ).move_to(UP * 0.8)
        rule = Line(
            LEFT * 1.4, RIGHT * 1.4, stroke_color=OCHRE, stroke_width=7,
        ).next_to(title, DOWN, buff=0.5)
        line1 = Text(
            "Identity security is a skill you can build.",
            font=SANS, color=INK, font_size=44,
        ).next_to(rule, DOWN, buff=0.6)
        line2 = Text(
            "Protocols · Vendors · Scenarios · Labs · Interviews",
            font=SANS, color=INK_SOFT, font_size=34,
        ).next_to(line1, DOWN, buff=0.5)

        self.play(FadeIn(title, shift=UP * 0.2), run_time=0.8)
        self.play(Create(rule), run_time=0.5)
        self.play(FadeIn(line1, shift=UP * 0.15), run_time=0.7)
        self.play(FadeIn(line2, shift=UP * 0.15), run_time=0.7)
        hold(self, "outro", 2.7)