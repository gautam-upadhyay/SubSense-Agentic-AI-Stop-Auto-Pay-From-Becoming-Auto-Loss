CREATE TABLE `agent_statuses` (
	`name` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`last_run` text NOT NULL,
	`observations` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `alerts` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`severity` text NOT NULL,
	`subscription_id` text NOT NULL,
	`merchant` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`financial_impact_monthly` real NOT NULL,
	`financial_impact_yearly` real NOT NULL,
	`recommendation` text NOT NULL,
	`ai_explanation` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	`old_amount` real,
	`new_amount` real
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`timestamp` text NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`details` text NOT NULL,
	`user_approved` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`platform` text NOT NULL,
	`platform_logo` text,
	`amount` real NOT NULL,
	`billing_cycle` text NOT NULL,
	`payment_method` text,
	`status` text NOT NULL,
	`transaction_id` text,
	`subscription_id` text,
	`created_at` text NOT NULL,
	`completed_at` text,
	`qr_code` text
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`merchant` text NOT NULL,
	`merchant_logo` text,
	`current_amount` real NOT NULL,
	`previous_amount` real,
	`billing_cycle` text NOT NULL,
	`status` text NOT NULL,
	`last_used_date` text,
	`next_billing_date` text NOT NULL,
	`category` text NOT NULL,
	`auto_pay_enabled` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`merchant` text NOT NULL,
	`merchant_logo` text,
	`amount` real NOT NULL,
	`transaction_type` text NOT NULL,
	`status` text NOT NULL,
	`subscription_id` text,
	`category` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `wallet` (
	`id` text PRIMARY KEY NOT NULL,
	`balance` real NOT NULL,
	`currency` text NOT NULL,
	`last_updated` text NOT NULL
);
