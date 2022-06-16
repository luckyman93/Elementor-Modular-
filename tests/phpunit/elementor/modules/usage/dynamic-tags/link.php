<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Usage\DynamicTags;

use Elementor\Core\DynamicTags\Base_Tag;

class Link extends Base_Tag
{
	public function get_categories() {
		return [];
	}

	public function get_group() {
		return [];
	}

	public function get_title() {
		return 'Link';
	}

	public function get_content( array $options = [] ) {
		return '';
	}

	public function get_content_type() {
		return '';
	}

	public function get_name() {
		return 'post-url';
	}
}
